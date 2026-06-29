/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_TOP?: string;
  readonly VITE_ADSENSE_SLOT_MID?: string;
  readonly VITE_ADSENSE_SLOT_FOOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
