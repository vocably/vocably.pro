/**
 * Firefox Polyfill for Stencil.js adoptedStyleSheets bug
 * 
 * Must be loaded BEFORE content-script.js in the manifest
 * 
 * Problem: Stencil.js runtime crashes when checking:
 *   Object.getOwnPropertyDescriptor(document.adoptedStyleSheets, "length").writable
 * 
 * In Firefox extension content scripts:
 * - document.adoptedStyleSheets may exist but getOwnPropertyDescriptor returns undefined
 * - This causes ".writable" access to crash
 */

console.log('[Firefox Polyfill] Starting...');

// Ensure adoptedStyleSheets exists
if (typeof document !== 'undefined') {
  const existingStyleSheets = (document as any).adoptedStyleSheets;
  
  if (!existingStyleSheets) {
    // Case 1: adoptedStyleSheets doesn't exist at all
    Object.defineProperty(document, 'adoptedStyleSheets', {
      value: [],
      writable: true,
      configurable: true
    });
    console.log('[Firefox Polyfill] Added document.adoptedStyleSheets');
  } else {
    // Case 2: adoptedStyleSheets exists but getOwnPropertyDescriptor returns undefined
    // Check if getOwnPropertyDescriptor works
    const descriptor = Object.getOwnPropertyDescriptor(existingStyleSheets, 'length');
    if (!descriptor) {
      console.log('[Firefox Polyfill] getOwnPropertyDescriptor returns undefined, patching...');
      // Replace with a proper empty array (can't spread the broken one)
      Object.defineProperty(document, 'adoptedStyleSheets', {
        value: [],
        writable: true,
        configurable: true
      });
      console.log('[Firefox Polyfill] Replaced adoptedStyleSheets with empty array');
    } else {
      console.log('[Firefox Polyfill] adoptedStyleSheets OK, descriptor:', descriptor);
    }
  }
}

console.log('[Firefox Polyfill] Complete');

