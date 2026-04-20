const sliders = [
    {id: "set-minDecibels", key: "minDecibels", valId: "val-minDecibels"},
    {id: "set-maxDecibels", key: "maxDecibels", valId: "val-maxDecibels"},
    {id: "set-smoothingTimeConstant", key: "smoothingTimeConstant", valId: "val-smoothingTimeConstant"},
    {id: "set-energySmoothing", key: "energySmoothing", valId: "val-energySmoothing"},
    {id: "set-bassSmoothing", key: "bassSmoothing", valId: "val-bassSmoothing"},
    {id: "set-windowSize", key: "windowSize", valId: "val-windowSize"},
    {id: "set-windowOpacity", key: "windowOpacity", valId: "val-windowOpacity"},
];

const selects = [
    {id: "set-visualizationMode", key: "visualizationMode", isInt: false},
    {id: "set-fftSize", key: "fftSize", isInt: true},
    {id: "set-colorScheme", key: "colorScheme", isInt: false},
];

const populate = (settings) => {
    for (const s of sliders) {
        const el = document.getElementById(s.id);
        const valEl = document.getElementById(s.valId);
        if (el) el.value = settings[s.key];
        if (valEl) valEl.textContent = settings[s.key];
    }
    for (const s of selects) {
        const el = document.getElementById(s.id);
        if (el) el.value = settings[s.key];
    }
};

const init = async () => {
    const settings = await globalThis.settingsAPI.getSettings();
    populate(settings);

    for (const s of sliders) {
        const el = document.getElementById(s.id);
        const valEl = document.getElementById(s.valId);
        el.addEventListener("input", async () => {
            const value = Number.parseFloat(el.value);
            valEl.textContent = el.value;
            await globalThis.settingsAPI.updateSettings({[s.key]: value});
        });
    }

    for (const s of selects) {
        const el = document.getElementById(s.id);
        el.addEventListener("change", async () => {
            const value = s.isInt ? Number.parseInt(el.value, 10) : el.value;
            await globalThis.settingsAPI.updateSettings({[s.key]: value});
        });
    }

    document.getElementById("reset-btn").addEventListener("click", async () => {
        const updated = await globalThis.settingsAPI.resetSettings();
        populate(updated);
    });

    globalThis.settingsAPI.onSettingsChanged((settings) => {
        populate(settings);
    });
};

init();
