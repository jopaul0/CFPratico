import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win : BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "desktop-icon.png"),
    title: "CF Pratico",
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win == null
      ? void 0
      : win.webContents.send(
          "main-process-message",
           new Date().toLocaleString()
        );
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.on("maximize", () => {
    win == null
      ? void 0
      : win.webContents.send("window-state-changed", "maximized");
  });

  win.on("unmaximize", () => {
    win == null
      ? void 0
      : win.webContents.send("window-state-changed", "unmaximized");
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("minimize-window", () => {
    win == null ? void 0 : win.minimize();
  });

  ipcMain.on("maximize-window", () => {
    if (win == null ? void 0 : win.isMaximized()) {
      win == null ? void 0 : win.unmaximize();
    } else {
      win == null ? void 0 : win.maximize();
    }
  });

  ipcMain.on("close-window", () => {
    win == null ? void 0 : win.close();
  });

  ipcMain.handle("export-pdf", async (event, html) => {
    const mainWin = BrowserWindow.fromWebContents(event.sender);
    if (!mainWin) {
      return { success: false, error: "Janela principal não encontrada." };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWin, {
      title: "Salvar Relatório em PDF",
      defaultPath: `relatorio_cfpratico_${Date.now()}.pdf`,
      filters: [{ name: "Arquivos PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    let printWin : BrowserWindow | null = new BrowserWindow({ show: false });
    try {
      const baseUrl = VITE_DEV_SERVER_URL
        ? VITE_DEV_SERVER_URL
        : `file://${RENDERER_DIST}`;
      await printWin.loadURL(
        "data:text/html;charset=utf-8," + encodeURIComponent(html),
        { baseURLForDataURL: baseUrl }
      );

      const pdfBuffer = await printWin.webContents.printToPDF({
        printBackground: true,
      });

      fs.writeFileSync(filePath, pdfBuffer);
      return { success: true, filePath };
    } catch (err : any) {
      return {
        success: false,
        error: err.message || "Erro desconhecido ao gerar PDF",
      };
    } finally {
      if (printWin) {
        printWin.close();
        printWin = null;
      }
    }
  });

  ipcMain.handle("export-excel", async (event, data) => {
    const mainWin = BrowserWindow.fromWebContents(event.sender);
    if (!mainWin) {
      return { success: false, error: "Janela principal não encontrada." };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWin, {
      title: "Salvar Relatório em Excel",
      defaultPath: `relatorio_cfpratico_${Date.now()}.xlsx`,
      filters: [{ name: "Arquivos Excel", extensions: ["xlsx"] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const buffer = Buffer.from(data);

    try {
      fs.writeFileSync(filePath, buffer);
      return { success: true, filePath };
    } catch (err : any) {
      return {
        success: false,
        error: err.message || "Erro desconhecido ao salvar Excel",
      };
    }
  });
});

export { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL };