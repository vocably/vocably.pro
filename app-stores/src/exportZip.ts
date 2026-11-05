import { zip } from 'fflate';
import { toBlob } from 'html-to-image';
import type { AssetFormat } from './formats';

type Files = Record<string, Uint8Array>;

type OnProgress = (done: number, total: number) => void;

const renderPng = async (node: HTMLElement, format: AssetFormat) => {
  // Web fonts that are still loading would fall back in the PNG.
  await document.fonts.ready;
  const blob = await toBlob(node, {
    width: format.width,
    height: format.height,
    pixelRatio: 1,
    // The node is scaled down for preview; export it unscaled.
    style: { transform: 'none' },
  });
  if (!blob) throw new Error('html-to-image returned no image');
  return new Uint8Array(await blob.arrayBuffer());
};

const createZip = (files: Files) =>
  new Promise<Uint8Array>((resolve, reject) =>
    // PNGs are already compressed, so store them as is.
    zip(files, { level: 0 }, (error, data) =>
      error ? reject(error) : resolve(data)
    )
  );

const download = (data: Uint8Array, name: string) => {
  const url = URL.createObjectURL(
    new Blob([data as Uint8Array<ArrayBuffer>], { type: 'application/zip' })
  );
  const link = document.createElement('a');
  link.download = name;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url));
};

// The [data-canvas] nodes inside `root`, by their path in the ZIP:
// one folder per [data-language] group, `en/01.png`, `en/02.png`, …
const collectCanvases = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[data-language]')].flatMap((group) =>
    [...group.querySelectorAll<HTMLElement>('[data-canvas]')].map(
      (node, index) => ({
        path: `${group.dataset.language}/${String(index + 1).padStart(2, '0')}.png`,
        node,
      })
    )
  );

// Renders every canvas inside `root` into a ZIP of
// `en/01.png`, `en/02.png`, …
const renderZip = async (
  root: HTMLElement,
  format: AssetFormat,
  onProgress?: OnProgress
) => {
  // Images that are still decoding would come out blank.
  await Promise.all(
    [...root.querySelectorAll('img')].map((img) => img.decode().catch(() => {}))
  );
  const canvases = collectCanvases(root);
  const files: Files = {};
  onProgress?.(0, canvases.length);
  // One at a time: html-to-image clones the whole subtree for every capture.
  for (const [done, { path, node }] of canvases.entries()) {
    files[path] = await renderPng(node, format);
    onProgress?.(done + 1, canvases.length);
  }
  return createZip(files);
};

// Exports every [data-canvas] inside `root` into `<format.id>.zip`.
export const exportZip = async (
  root: HTMLElement,
  format: AssetFormat,
  onProgress?: OnProgress
) => download(await renderZip(root, format, onProgress), `${format.id}.zip`);

// Exports `formats` into `<name>.zip`, holding one `<format.id>.zip` per
// format, the same ZIP exportZip downloads. `show(format)` must render the
// format's screenshots into the returned node before it resolves.
export const exportAllZip = async (
  name: string,
  formats: AssetFormat[],
  show: (format: AssetFormat) => Promise<HTMLElement>,
  onProgress?: (format: AssetFormat, done: number, total: number) => void
) => {
  const files: Files = {};
  for (const format of formats) {
    files[`${format.id}.zip`] = await renderZip(
      await show(format),
      format,
      (done, total) => onProgress?.(format, done, total)
    );
  }
  download(await createZip(files), `${name}.zip`);
};
