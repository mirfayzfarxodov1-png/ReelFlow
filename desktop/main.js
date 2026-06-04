const { app, BrowserWindow, ipcMain, Menu, shell, nativeTheme } = require('electron');
const path = require('path');
const electronStore = require('electron-store');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Store
const store = new electronStore({
  defaults: {
    theme: 'dark',
    windowBounds: { width: 1200, height: 800 },
    rememberWindow: true
  }
});

// Disable GPU acceleration for some systems
app.disableHardwareAcceleration();

// Keep a global reference of the window object
let mainWindow = null;

// Enable live reload for Electron in development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

// Create window
function createWindow() {
  const { width, height } = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // Load app
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Save window bounds on resize
  mainWindow.on('resize', () => {
    if (!mainWindow.isMaximized()) {
      const { width, height } = mainWindow.getBounds();
      store.set('windowBounds', { width, height });
    }
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Auto updater
  autoUpdater.checkForUpdatesAndNotify();
}

// App ready
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'ReelFlow',
      submenu: [
        { label: 'About ReelFlow', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => { mainWindow.webContents.send('open-settings'); } },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { app.quit(); } }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => { mainWindow.reload(); } },
        { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
        { type: 'separator' },
        { label: 'Toggle Dark Mode', click: () => { toggleTheme(); } }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => { shell.openExternal('https://reelflow.com/docs'); } },
        { label: 'Report Issue', click: () => { shell.openExternal('https://github.com/reelflow/issues'); } }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Toggle theme
function toggleTheme() {
  const currentTheme = nativeTheme.shouldUseDarkColors;
  nativeTheme.themeSource = currentTheme ? 'light' : 'dark';
  store.set('theme', currentTheme ? 'light' : 'dark');
  mainWindow.webContents.send('theme-changed', !currentTheme);
}

// IPC handlers
ipcMain.handle('store:get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('app:version', () => {
  return app.getVersion();
});

ipcMain.handle('app:platform', () => {
  return process.platform;
});

// Auto updater events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

// Logging
log.info('App started');
