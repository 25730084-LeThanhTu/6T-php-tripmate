// Build/serve Angular bằng Rspack (thay cho `ng build` / `ng serve`)
//   yarn start  -> rspack serve  (cấu hình development)
//   yarn build  -> rspack build  (cấu hình production)
// Có thể ép cấu hình bằng biến môi trường NGRS_CONFIG=development|production
import { createConfig } from '@nx/angular-rspack';

export default createConfig(
  {
    options: {
      root: import.meta.dirname,
      browser: './src/main.ts',
      index: './src/index.html',
      tsConfig: './tsconfig.app.json',
      inlineStyleLanguage: 'scss',
      assets: [{ glob: '**/*', input: 'public' }],
      styles: ['./src/styles.scss'],
      outputPath: { base: './dist/frontend' },
      devServer: { port: 4200 },
    },
  },
  {
    production: {
      options: {
        outputHashing: 'all',
        budgets: [
          { type: 'initial', maximumWarning: '500kB', maximumError: '1MB' },
          { type: 'anyComponentStyle', maximumWarning: '4kB', maximumError: '8kB' },
        ],
      },
    },
    development: {
      options: {
        optimization: false,
        extractLicenses: false,
        sourceMap: true,
        namedChunks: true,
        fileReplacements: [
          {
            replace: './src/environments/environment.ts',
            with: './src/environments/environment.development.ts',
          },
        ],
      },
    },
  },
);
