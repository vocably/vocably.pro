type BrowserEnv = typeof chrome | typeof browser;
type Offscreenable = Pick<typeof chrome, 'offscreen'>;
export declare let browserEnv: BrowserEnv;
export declare const hasOffscreen: (browserEnv: any) => browserEnv is Offscreenable;
export {};
