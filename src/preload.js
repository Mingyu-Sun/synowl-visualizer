const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    showContextMenu: () => ipcRenderer.send('show-context-menu'),
    onContextMenuCommand: (callback) =>
        ipcRenderer.on('context-menu-command', (event, command) => callback(command))

});