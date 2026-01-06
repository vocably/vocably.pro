/**
 * Replacement for lodash-es _root module that uses globalThis
 * instead of Function('return this')() which is blocked by CSP
 */
const root = typeof globalThis !== 'undefined' ? globalThis :
             typeof self !== 'undefined' ? self :
             typeof window !== 'undefined' ? window :
             typeof global !== 'undefined' ? global : {};

export default root;
