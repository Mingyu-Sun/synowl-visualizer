const VISUALIZATION_MODES = ['radial', 'waveform', 'spectrum', 'particles'];
const COLOR_SCHEMES = ['dynamic', 'cool', 'warm', 'monochrome'];

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
    particlesMax: 300,
    spectrumBars: 64,
    radialInnerRatio: 0.2,
    windowX: undefined,
    windowY: undefined,
};

const clamp = (k, v) => {
    switch (k) {
        case 'windowSize': return Math.max(300, Math.min(800, v));
        case 'windowOpacity': return Math.max(0.2, Math.min(1.0, v));
        case 'smoothingTimeConstant': return Math.max(0, Math.min(0.99, v));
        case 'minDecibels': return Math.max(-100, Math.min(-30, v));
        case 'maxDecibels': return Math.max(-60, Math.min(0, v));
        case 'energySmoothing': return Math.max(0.01, Math.min(0.5, v));
        case 'bassSmoothing': return Math.max(0.01, Math.min(0.5, v));
        case 'baseHue': return ((v % 360) + 360) % 360;
        case 'particlesMax': return Math.max(50, Math.min(1000, Math.round(v)));
        case 'spectrumBars': return Math.max(16, Math.min(256, Math.round(v)));
        case 'radialInnerRatio': return Math.max(0.05, Math.min(0.45, v));
        default: return v;
    }
};

const SCHEMA = {
    fftSize: (v) => [512, 1024, 2048, 4096, 8192].includes(v),
    minDecibels: (v) => typeof v === 'number' && v >= -100 && v <= -30,
    maxDecibels: (v) => typeof v === 'number' && v >= -60 && v <= 0,
    smoothingTimeConstant: (v) => typeof v === 'number' && v >= 0 && v <= 0.99,
    colorScheme: (v) => COLOR_SCHEMES.includes(v),
    baseHue: (v) => typeof v === 'number' && v >= 0 && v < 360,
    visualizationMode: (v) => VISUALIZATION_MODES.includes(v),
    windowOpacity: (v) => typeof v === 'number' && v >= 0.2 && v <= 1.0,
    windowSize: (v) => typeof v === 'number' && v >= 300 && v <= 800,
    energySmoothing: (v) => typeof v === 'number' && v >= 0.01 && v <= 0.5,
    bassSmoothing: (v) => typeof v === 'number' && v >= 0.01 && v <= 0.5,
    particlesMax: (v) => typeof v === 'number' && v >= 50 && v <= 1000,
    spectrumBars: (v) => typeof v === 'number' && v >= 16 && v <= 256,
    radialInnerRatio: (v) => typeof v === 'number' && v > 0 && v < 0.5,
    windowX: (v) => typeof v === 'number' || v === undefined,
    windowY: (v) => typeof v === 'number' || v === undefined,
};

const validate = (partial) => {
    const clean = {};
    if (!partial || typeof partial !== 'object') return clean;
    for (const [k, v] of Object.entries(partial)) {
        if (SCHEMA[k] && SCHEMA[k](v)) {
            clean[k] = clamp(k, v);
        }
    }
    return clean;
};

module.exports = {defaults, clamp, validate, SCHEMA, VISUALIZATION_MODES, COLOR_SCHEMES};
