const {app} = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

const defaults = {
    fftSize: 2048,
    minDecibels: -85,
    maxDecibels: -25,
    smoothingTimeConstant: 0.8,
    colorScheme: 'dynamic',
    baseHue: 200,
    visualizationMode: 'radial',
    windowOpacity: 1.0,
    windowSize: 300,
    energySmoothing: 0.12,
    bassSmoothing: 0.2,
    windowX: undefined,
    windowY: undefined,
};

const load = () => {
    try {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return {...defaults, ...JSON.parse(data)};
    } catch {
        return {...defaults};
    }
};

const save = (settings) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
};

let current = load();

const getSettings = () => ({...current});

const updateSettings = (partial) => {
    current = {...current, ...partial};
    save(current);
    return {...current};
};

const resetSettings = () => {
    const {windowX, windowY} = current;
    current = {...defaults, windowX, windowY};
    save(current);
    return {...current};
};

const setWindowPosition = (x, y) => {
    current.windowX = x;
    current.windowY = y;
    save(current);
};

module.exports = {getSettings, updateSettings, resetSettings, setWindowPosition, defaults};
