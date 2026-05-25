interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // add other env vars here as needed
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
