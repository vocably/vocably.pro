// Replaces the AI and translation SDKs in the SEO renderer bundle (see
// webpack.config.js). Importing and constructing works, because some modules
// create clients at import time; calling anything throws.

const fail = () => {
  throw new Error('AI and translation SDKs are not available in seo-backend');
};

function Stub() {
  if (!new.target) {
    fail();
  }

  return new Proxy({}, { get: () => fail });
}

module.exports = new Proxy(
  {},
  {
    get: (_, property) => (property === '__esModule' ? false : Stub),
  }
);
