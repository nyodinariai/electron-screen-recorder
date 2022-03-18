const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
let win;
const appUrl = `file://${__dirname}/index.html`;

function createElectronShell() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  win.loadURL(appUrl);
  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createElectronShell);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("active", () => {
  if (app === null) {
    createElectronShell();
  }
});

ipcMain.handle("DESKTOP_CAPTURER_GET_SOURCES", (event, opts) =>
  desktopCapturer.getSources(opts)
);
