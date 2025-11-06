// electron/main.ts

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os' // 1. Importar 'os'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'desktop-icon.png'),
    title: "CF Pratico",
    frame: false,
    titleBarStyle: 'hidden', 
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('maximize', () => {
    win?.webContents.send('window-state-changed', 'maximized');
  });
  win.on('unmaximize', () => {
    win?.webContents.send('window-state-changed', 'unmaximized');
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('minimize-window', () => {
    win?.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    win?.close();
  });

  // --- INÍCIO DA CORREÇÃO (PLANO B) ---
  ipcMain.handle('export-pdf', async (event, html: string) => {
    const mainWin = BrowserWindow.fromWebContents(event.sender);
    if (!mainWin) {
      return { success: false, error: 'Janela principal não encontrada.' };
    }

    // 1. Abre o diálogo "Salvar Como..." (sem alteração)
    const { canceled, filePath } = await dialog.showSaveDialog(mainWin, {
      title: 'Salvar Relatório em PDF',
      defaultPath: `relatorio_cfpratico_${Date.now()}.pdf`,
      filters: [{ name: 'Arquivos PDF', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // 2. Cria uma janela oculta
    let printWin: BrowserWindow | null = new BrowserWindow({ show: false });

    // 3. (REMOVIDO - Não usamos mais arquivo temporário)

    try {
      // 4. Define a URL base para encontrar os assets (logo)
      //    Em dev, a base é o servidor do Vite (ex: http://localhost:5173)
      //    Em produção, a base é a pasta 'dist' no filesystem
      const baseUrl = VITE_DEV_SERVER_URL
        ? VITE_DEV_SERVER_URL
        : `file://${RENDERER_DIST}`;

      // 5. Carrega o HTML diretamente como uma string (sem arquivo temp)
      //    e informa qual é a URL base para resolver caminhos como /assets/onvale.png
      await printWin.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(html),
        { baseURLForDataURL: baseUrl }
      );

      // 6. Gera o PDF (agora com a logo!)
      const pdfBuffer = await printWin.webContents.printToPDF({
        printBackground: true,
      });

      // 7. Salva o PDF no local que o usuário escolheu
      fs.writeFileSync(filePath, pdfBuffer);

      return { success: true, filePath };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro desconhecido ao gerar PDF' };
    } finally {
      // 8. Limpa tudo (mesmo se der erro)
      if (printWin) {
        printWin.close();
        printWin = null;
      }
      // (REMOVIDO - Bloco de remoção do tempHtmlPath)
    }
  });
  // --- FIM DA CORREÇÃO ---
});