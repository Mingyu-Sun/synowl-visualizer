import {app, BrowserWindow, desktopCapturer, session} from 'electron';
import electronSquirrelStartup from 'electron-squirrel-startup';
import path from 'node:path';

if (electronSquirrelStartup) {
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(import.meta.dirname, 'preload.js'),
        },
    });

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({types: ['screen']}).then((sources) => {
            callback({video: sources[0], audio: 'loopback'});
        });
    });

    mainWindow.loadFile(path.join(import.meta.dirname, 'index.html'));
    mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
