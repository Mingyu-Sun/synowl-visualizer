const {app, ipcMain, BrowserWindow, Menu, Tray, desktopCapturer, session, screen} = require("electron");
const path = require("node:path");
const {getSettings, updateSettings, resetSettings, setWindowPosition} = require("./settings.js");

if (require("electron-squirrel-startup")) {
    app.quit();
}

let mainWindow;
let settingsWindow = null;
let tray;

const isPositionOnScreen = (x, y, size) => {
    const displays = screen.getAllDisplays();
    return displays.some(d => {
        const b = d.bounds;
        return x < b.x + b.width - 50 &&
            x + size > b.x + 50 &&
            y < b.y + b.height - 50 &&
            y + size > b.y + 50;
    });
};

const createWindow = () => {
    const settings = getSettings();

    const usePosition = settings.windowX !== undefined &&
        settings.windowY !== undefined &&
        isPositionOnScreen(settings.windowX, settings.windowY, settings.windowSize);

    mainWindow = new BrowserWindow({
        width: settings.windowSize,
        height: settings.windowSize,
        ...(usePosition ? {x: settings.windowX, y: settings.windowY} : {}),
        opacity: settings.windowOpacity,
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
    });

    let savePosTimer = null;
    mainWindow.on("moved", () => {
        clearTimeout(savePosTimer);
        savePosTimer = setTimeout(() => {
            const [x, y] = mainWindow.getPosition();
            setWindowPosition(x, y);
        }, 500);
    });

    // --- Context menu ---
    ipcMain.on("show-context-menu", (event) => {
        const template = [
            {label: "Setting", click: () => openSettingsWindow()},
            {label: "Quit", role: "quit"},
            {type: "separator"},
            {label: "Inspect", role: "toggleDevTools"}
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup({window: BrowserWindow.fromWebContents(event.sender)});
    });

    // --- Settings IPC handlers ---
    ipcMain.handle("get-settings", () => getSettings());

    ipcMain.handle("update-settings", (event, partial) => {
        const updated = updateSettings(partial);
        mainWindow.webContents.send("settings-changed", updated);
        if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.webContents.send("settings-changed", updated);
        }
        if (partial && partial.windowSize !== undefined) {
            const s = Math.max(300, Math.min(800, Math.round(partial.windowSize)));
            mainWindow.setSize(s, s);
        }
        if (partial && partial.windowOpacity !== undefined) {
            mainWindow.setOpacity(Math.max(0.2, Math.min(1.0, partial.windowOpacity)));
        }
        return updated;
    });

    ipcMain.handle("reset-settings", () => {
        const updated = resetSettings();
        mainWindow.webContents.send("settings-changed", updated);
        if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.webContents.send("settings-changed", updated);
        }
        mainWindow.setSize(updated.windowSize, updated.windowSize);
        mainWindow.setOpacity(updated.windowOpacity);
        return updated;
    });

    ipcMain.on("open-settings", () => openSettingsWindow());

    ipcMain.on("request-toggle-capture", () => {
        mainWindow.webContents.send("toggle-capture");
    });

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({types: ["screen"]}).then((sources) => {
            callback({video: sources[0], audio: "loopback"});
        });
    });

    mainWindow.webContents.on("render-process-gone", (event, details) => {
        console.error("Renderer process gone:", details.reason);
        mainWindow.reload();
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
};

const openSettingsWindow = () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 320,
        height: 560,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: "Settings",
        webPreferences: {
            preload: path.join(__dirname, "settings-preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
    });

    settingsWindow.setMenuBarVisibility(false);
    settingsWindow.loadFile(path.join(__dirname, "settings.html"));

    settingsWindow.on("closed", () => {
        settingsWindow = null;
    });
};

const createTray = () => {
    const icon = path.join(__dirname, "assets/icon.png");
    tray = new Tray(icon);

    const buildTrayMenu = () => Menu.buildFromTemplate([
        {
            label: "Show / Hide",
            click: () => {
                if (mainWindow.isVisible()) mainWindow.hide();
                else mainWindow.show();
            }
        },
        {
            label: "Start / Stop",
            click: () => ipcMain.emit("request-toggle-capture")
        },
        {label: "Settings", click: () => openSettingsWindow()},
        {type: "separator"},
        {role: "quit"}
    ]);

    tray.setContextMenu(buildTrayMenu());
    tray.on("click", () => tray.setContextMenu(buildTrayMenu()));
};

app.whenReady().then(() => {
    if (process.platform === "darwin") {
        app.dock.hide();
    }
    createWindow();
    createTray();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
