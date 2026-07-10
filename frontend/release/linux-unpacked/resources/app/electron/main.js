const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#050505',
    show: false,                      // keep hidden until content is ready
    autoHideMenuBar: true,            // hide default menu bar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,           // allow cross-origin API calls from file://
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  // load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3004');
    mainWindow.webContents.openDevTools();
  } else {
    // when packaged the app's resources are placed in an asar archive under
    // `resources/app.asar`.  __dirname will point to the `electron` subfolder
    // inside that archive, but our built UI lives at the project root `dist/`.
    // climb up one directory to access it.
    let indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (!require('fs').existsSync(indexPath)) {
      // fallback: maybe builder unpacked to resources/app/dist
      indexPath = path.join(process.resourcesPath, 'dist', 'index.html');
    }
    mainWindow.loadFile(indexPath);
  }

  // show the window as soon as the renderer says it's ready to paint
  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// handle minimize to tray (optional)
ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

