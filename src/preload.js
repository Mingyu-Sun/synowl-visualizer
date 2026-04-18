const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    showContextMenu: () => ipcRenderer.send('show-context-menu'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (partial) => ipcRenderer.invoke('update-settings', partial),
    onSettingsChanged: (callback) =>
        ipcRenderer.on('settings-changed', (event, settings) => callback(settings)),
    openSettings: () => ipcRenderer.send('open-settings'),
    onToggleCapture: (callback) =>
        ipcRenderer.on('toggle-capture', () => callback()),
});
