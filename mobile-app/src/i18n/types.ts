type PluralSuffix = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type MakeFlexibleSchema<T> = {
  // 1. Handle standard keys: recurse if object, enforce string if primitive
  [K in keyof T as K extends `${string}_${PluralSuffix}`
    ? never
    : K]: T[K] extends object ? MakeFlexibleSchema<T[K]> : string;
} & {
  // 2. Handle plural keys: allow any language-specific plural suffix dynamically
  [K in keyof T as K extends `${infer Base}_${PluralSuffix}`
    ? `${Base}_${PluralSuffix}`
    : never]?: string;
};
