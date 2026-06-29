/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_TOP?: string;
  readonly VITE_ADSENSE_SLOT_MID?: string;
  readonly VITE_ADSENSE_SLOT_FOOT?: string;
  readonly VITE_ANALYTICS_INGEST_URL?: string;
  readonly VITE_ANALYTICS_STATS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
