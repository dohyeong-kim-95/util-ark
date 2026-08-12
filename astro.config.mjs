import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://utilark.app',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://utilark.app/',
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          ko: 'ko',
        },
      },
    }),
  ],
});
