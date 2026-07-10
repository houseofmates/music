const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  platform: process.platform
});

// Add electron class to body for CSS targeting
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron');
});

