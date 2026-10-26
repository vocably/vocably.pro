#!/usr/bin/env -S npx vite-node

// Generates a PDF invoice to Apple or Google for a month of app store
// proceeds.
//
//   ./scripts/store-invoice.mts <apple|google> <YYYY-MM> <amount> [--currency EUR] [--date YYYY-MM-DD]
//
// <YYYY-MM> is the month the invoice is for and <amount> is what the store
// paid for it, as shown in Payments and Financial Reports in App Store
// Connect or in the Play Console payouts. The currency defaults to EUR.
//
// The invoice number is YEAR-SERIES-MONTH, where the series is 1 for Apple
// and 2 for Google (e.g. 2026-1-09, 2026-2-09). The PDF is written to
// ~/Downloads/YEAR-<store>-MONTH.pdf (e.g. 2026-google-09.pdf). The invoice
// date defaults to the first day of the following month.
//
// Reads INVOICE_SELLER_NAME, INVOICE_SELLER_ADDRESS and optionally
// INVOICE_SELLER_TAX_ID (the VAT number), INVOICE_SELLER_BANK,
// INVOICE_SELLER_EMAIL (multiline in double quotes, or \n for line breaks)
// and APP_STORE_VENDOR_NUMBER (Apple only) from the environment, scripts/.env.local or
// scripts/.env. Set CHROME_PATH if Google Chrome isn't in /Applications.

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

type Store = {
  series: number;
  buyer: string[];
  description: string;
  vatLabel: string;
  vatNote: string;
  vendorNumber?: string;
};

const stores: Record<string, Store> = {
  // Apple Inc. is a business outside the EU, so the place of supply is
  // outside the Netherlands and no Dutch VAT is charged.
  apple: {
    series: 1,
    buyer: [
      'Apple Inc.',
      'One Apple Park Way',
      'Cupertino, CA 95014',
      'United States',
    ],
    description: 'Proceeds from the sale of apps through the App Store',
    vatLabel: 'VAT (0%)',
    vatNote:
      'VAT not applicable: services supplied to a business established outside the EU, place of supply outside the Netherlands (Article 44, Council Directive 2006/112/EC).',
    vendorNumber: process.env.APP_STORE_VENDOR_NUMBER,
  },
  // Google Ireland Limited is a business in another EU country, so the VAT is
  // reverse charged.
  google: {
    series: 2,
    buyer: [
      'Google Ireland Limited',
      'Gordon House, Barrow Street',
      'Dublin 4, D04 E5W5',
      'Ireland',
      'VAT: IE6388047V',
    ],
    description: 'Proceeds from the sale of apps through Google Play',
    vatLabel: 'VAT (reverse charge)',
    vatNote:
      'VAT reverse charged: VAT is to be accounted for by the recipient (Article 196, Council Directive 2006/112/EC).',
  },
};

const chromePath =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const usage =
  'Usage: ./scripts/store-invoice.mts <apple|google> <YYYY-MM> <amount> [--currency EUR] [--date YYYY-MM-DD]';

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const [storeName, calendarMonth, amountArg] = args;
const store = stores[storeName];
if (!store) {
  console.error(usage);
  process.exit(1);
}
if (!calendarMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(calendarMonth)) {
  console.error(usage);
  process.exit(1);
}

const amount = Number(amountArg);
if (!amountArg || !(amount > 0)) {
  console.error(
    `<amount> ${amountArg ?? ''} is not a positive number.\n${usage}`
  );
  process.exit(1);
}

const currency = (option('currency') ?? 'EUR').toUpperCase();
const [year, month] = calendarMonth.split('-');
const invoiceDate =
  option('date') ??
  new Date(Date.UTC(+year, +month, 1)).toISOString().slice(0, 10);

if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) {
  console.error(`--date ${invoiceDate} is not YYYY-MM-DD.`);
  process.exit(1);
}

const invoiceNumber = `${year}-${store.series}-${month}`;
const monthName = new Date(Date.UTC(+year, +month - 1)).toLocaleString(
  'en-US',
  { month: 'long', year: 'numeric', timeZone: 'UTC' }
);
const lastDay = new Date(Date.UTC(+year, +month, 0)).getUTCDate();
const period = `${calendarMonth}-01 – ${calendarMonth}-${lastDay}`;

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set.`);
    process.exit(1);
  }
  return value;
};

const multiline = (value?: string) =>
  value ? value.split(/\\n|\n/).map((line) => line.trim()) : [];
const sellerLines = [
  requireEnv('INVOICE_SELLER_NAME'),
  ...multiline(requireEnv('INVOICE_SELLER_ADDRESS')),
  ...multiline(process.env.INVOICE_SELLER_TAX_ID).map((id) => `VAT: ${id}`),
  ...multiline(process.env.INVOICE_SELLER_EMAIL),
];
const bankLines = multiline(process.env.INVOICE_SELLER_BANK);

const formatAmount = (value: number) =>
  `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!
  );
const block = (values: string[]) => values.map(escape).join('<br>');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Invoice ${invoiceNumber}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font: 10.5pt/1.45 -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 22pt; margin: 0 0 4mm; }
  .meta td { padding: 0 6mm 1mm 0; }
  .meta td:first-child { color: #666; }
  .parties { display: flex; gap: 12mm; margin: 10mm 0; }
  .parties > div { flex: 1; }
  .label { color: #666; font-size: 9pt; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 1.5mm; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 4mm; }
  table.items th, table.items td { text-align: left; padding: 2mm 0; border-bottom: 1px solid #ddd; vertical-align: top; }
  table.items th { color: #666; font-weight: normal; font-size: 9pt; text-transform: uppercase; letter-spacing: .05em; }
  .num { text-align: right !important; white-space: nowrap; }
  .total td { border-bottom: none; font-weight: bold; font-size: 12pt; padding-top: 4mm; }
  .nowrap { white-space: nowrap; }
  .note { margin-top: 8mm; font-size: 9pt; color: #444; }
  .bank { margin-top: 10mm; }
</style>
</head>
<body>
  <h1>Invoice</h1>
  <table class="meta">
    <tr><td>Invoice number</td><td>${invoiceNumber}</td></tr>
    <tr><td>Invoice date</td><td>${invoiceDate}</td></tr>
    ${store.vendorNumber ? `<tr><td>Apple vendor number</td><td>${escape(store.vendorNumber)}</td></tr>` : ''}
  </table>

  <div class="parties">
    <div><div class="label">From</div>${block(sellerLines)}</div>
    <div><div class="label">Bill to</div>${block(store.buyer)}</div>
  </div>

  <table class="items">
    <tr><th>Description</th><th class="num">Amount</th></tr>
    <tr>
      <td>${store.description},
        ${monthName} <span class="nowrap">(${period})</span></td>
      <td class="num">${formatAmount(amount)}</td>
    </tr>
    <tr><td>${store.vatLabel}</td><td class="num">${formatAmount(0)}</td></tr>
    <tr class="total"><td>Total</td><td class="num">${formatAmount(amount)}</td></tr>
  </table>

  <div class="note">${escape(store.vatNote)}</div>

  ${bankLines.length ? `<div class="bank"><div class="label">Bank details</div>${block(bankLines)}</div>` : ''}
</body>
</html>
`;

const outputDir = join(homedir(), 'Downloads');
const pdfPath = join(outputDir, `${year}-${storeName}-${month}.pdf`);
const workDir = mkdtempSync(join(tmpdir(), 'store-invoice-'));
const htmlPath = join(workDir, `${invoiceNumber}.html`);

try {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(htmlPath, html);
  execFileSync(
    chromePath,
    [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore' }
  );
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(
  `Invoice ${invoiceNumber}, ${invoiceDate}, ${formatAmount(amount)}\n${pdfPath}`
);
