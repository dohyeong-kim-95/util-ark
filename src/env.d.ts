/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
