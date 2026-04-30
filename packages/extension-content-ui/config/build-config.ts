import { angularOutputTarget } from '@stencil/angular-output-target';
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

type ConfigOptions = {
  buildDir: string;
};

export const buildConfig = ({ buildDir }: ConfigOptions): Config => ({
  namespace: 'extension-content-ui',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      dir: buildDir,
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    {
      type: 'dist-hydrate-script',
    },
    angularOutputTarget({
      componentCorePackage: '@vocably/extension-content-ui',
      directivesProxyFile:
        '../extension-angular-components/projects/library/src/lib/stencil-generated/components.ts',
      directivesArrayFile:
        '../extension-angular-components/projects/library/src/lib/stencil-generated/index.ts',
    }),
  ],
  plugins: [sass()],
  devServer: {
    port: 8010,
  },
});
