/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// --- MODIFICADO PARA CORRESPONDER AO SEU PRELOAD.TS ---
// Define os tipos para a API exata exposta em electron/preload.ts
interface Window {
  ipcRenderer: {
    on: (channel: string, listener: (event: import('electron').IpcRendererEvent, ...args: any[]) => void) => import('electron').IpcRenderer;
    off: (channel: string, ...args: any[]) => import('electron').IpcRenderer;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  }
}