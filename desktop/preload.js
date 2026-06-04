const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value)
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
    getPlatform: () => ipcRenderer.invoke('app:platform'),
    quit: () => ipcRenderer.send('app:quit')
  },
  updater: {
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    restartApp: () => ipcRenderer.send('restart-app')
  },
  theme: {
    onChanged: (callback) => ipcRenderer.on('theme-changed', callback)
  },
  settings: {
    open: () => ipcRenderer.send('open-settings')
  }
});
