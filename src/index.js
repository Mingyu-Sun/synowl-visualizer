const {app, ipcMain, BrowserWindow, Menu, Tray, desktopCapturer, session} = require('electron');
const path = require('node:path');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;
let tray;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 300,
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

    ipcMain.on('show-context-menu', (event) => {
        const template = [
            {
                label: 'Setting',
                click:
                    () => {
                        event.sender.send('context-menu-command', 'setting');
                    }
            },
            {label: 'Quit', role: 'quit'},
            {type: 'separator'},
            {label: 'Inspect', role: 'toggleDevTools'}
        ];
        const menu = Menu.buildFromTemplate(template);

        menu.popup({window: BrowserWindow.fromWebContents(event.sender)});
    });

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({types: ['screen']}).then((sources) => {
            callback({video: sources[0], audio: 'loopback'});
        });
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

const createTray = () => {
    const icon = path.join(__dirname, 'assets/icon.png');
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

