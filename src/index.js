const {app, ipcMain, BrowserWindow, Menu, Tray, desktopCapturer, session} = require('electron');
const path = require('node:path');
const {getSettings, updateSettings, resetSettings} = require('./settings.js');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;
let settingsWindow = null;
let tray;

const createWindow = () => {
    const settings = getSettings();

    mainWindow = new BrowserWindow({
        width: settings.windowSize,
        height: settings.windowSize,
        opacity: settings.windowOpacity,
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
    });

    // --- Context menu ---
    ipcMain.on('show-context-menu', (event) => {
        const template = [
            {
                label: 'Setting',
                click: () => openSettingsWindow(),
            },
            {label: 'Quit', role: 'quit'},
            {type: 'separator'},
            {label: 'Inspect', role: 'toggleDevTools'}
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup({window: BrowserWindow.fromWebContents(event.sender)});
    });

    // --- Settings IPC handlers ---
    ipcMain.handle('get-settings', () => {
        return getSettings();
    });

    ipcMain.handle('update-settings', (event, partial) => {
        const updated = updateSettings(partial);
        // Notify the main visualizer window
        mainWindow.webContents.send('settings-changed', updated);
        // Also notify settings window if open (to sync after reset)
        if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.webContents.send('settings-changed', updated);
        }
        // Apply window-level settings immediately
        if (partial.windowSize !== undefined) {
            const s = Math.max(300, Math.min(800, Math.round(partial.windowSize)));
            mainWindow.setSize(s, s);
        }
        if (partial.windowOpacity !== undefined) {
            mainWindow.setOpacity(Math.max(0.2, Math.min(1.0, partial.windowOpacity)));
        }
        return updated;
    });

    ipcMain.handle('reset-settings', () => {
        const updated = resetSettings();
        mainWindow.webContents.send('settings-changed', updated);
        if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.webContents.send('settings-changed', updated);
        }
        // Reset window-level properties
        mainWindow.setSize(updated.windowSize, updated.windowSize);
        mainWindow.setOpacity(updated.windowOpacity);
        return updated;
    });

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({types: ['screen']}).then((sources) => {
            callback({video: sources[0], audio: 'loopback'});
        });
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

const openSettingsWindow = () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 320,
        height: 520,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: 'Settings',
        webPreferences: {
            preload: path.join(__dirname, 'settings-preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
    });

    settingsWindow.setMenuBarVisibility(false);
    settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
};

const createTray = () => {
    const icon = path.join(__dirname, 'assets/icon.png');
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Settings', click: () => openSettingsWindow()},
        {role: 'quit'}
    ]);
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    if (process.platform === 'darwin') {
        app.dock.hide();
    }
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
