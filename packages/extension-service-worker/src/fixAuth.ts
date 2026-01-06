// @ts-ignore
// Fix for AWS Amplify Auth in service worker context
// Chrome: self.window is undefined, we can set it
// Firefox: self.window exists but is getter-only, skip setting it
if (typeof self.window === 'undefined') {
  try {
    // @ts-ignore
    self.window = {
      crypto: crypto,
    };
  } catch (e) {
    // Firefox: window property is getter-only, ignore error
    console.log('Cannot set self.window (Firefox):', (e as Error).message);
  }
}
