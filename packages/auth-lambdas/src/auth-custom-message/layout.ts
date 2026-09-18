const BRAND = '#0050ff';
const TEXT = '#1b1b1f';
const MUTED = '#5f6368';
const BORDER = '#e3e3e8';
const BACKGROUND = '#f5f5f7';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export type Field = {
  label: string;
  /**
   * Rendered verbatim. Cognito placeholders ({####}, the usernameParameter)
   * must survive untouched, so this is not escaped - never pass user input.
   */
  value: string;
};

export type EmailContent = {
  heading: string;
  paragraphs: string[];
  fields: Field[];
  footer: string;
};

/**
 * Table-based with inline styles: the usual constraints of email clients, which
 * strip <style> blocks and ignore flex/grid. Kept to a light palette rather than
 * trying to support dark mode, which Gmail and Outlook invert unpredictably.
 */
export const renderEmail = ({
  heading,
  paragraphs,
  fields,
  footer,
}: EmailContent): string => {
  const body = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:${TEXT};">${escapeHtml(
          paragraph
        )}</p>`
    )
    .join('');

  const renderedFields = fields
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:0 0 4px;font-size:13px;line-height:18px;color:${MUTED};">${escapeHtml(
            label
          )}</td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;font-size:28px;line-height:36px;font-weight:700;letter-spacing:3px;color:${TEXT};font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;">${value}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:${BACKGROUND};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BACKGROUND};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;">
            <tr>
              <td style="padding:32px 32px 0;">
                <div style="font-size:20px;line-height:28px;font-weight:700;color:${BRAND};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Vocably</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:30px;font-weight:700;color:${TEXT};">${escapeHtml(
                  heading
                )}</h1>
                ${body}
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${renderedFields}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="margin:0;padding-top:16px;border-top:1px solid ${BORDER};font-size:13px;line-height:20px;color:${MUTED};">${escapeHtml(
                  footer
                )}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
