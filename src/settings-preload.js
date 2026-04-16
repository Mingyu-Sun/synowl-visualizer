const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (partial) => ipcRenderer.invoke('update-settings', partial),
    resetSettings: () => ipcRenderer.invoke('reset-settings'),
    onSettingsChanged: (callback) =>
        ipcRenderer.on('settings-changed', (event, settings) => callback(settings)),
});
