const {app} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const {defaults, validate} = require('./settings-schema.js');

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

const load = () => {
    try {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        const validated = validate(parsed);
        if (typeof parsed.windowX === 'number') validated.windowX = parsed.windowX;
        if (typeof parsed.windowY === 'number') validated.windowY = parsed.windowY;
        return {...defaults, ...validated};
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
    const validated = validate(partial);
    current = {...current, ...validated};
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
