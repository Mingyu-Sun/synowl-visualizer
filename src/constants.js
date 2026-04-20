export const VISUALIZATION_MODES = ["radial", "waveform", "spectrum", "particles"];
export const COLOR_SCHEMES = ["dynamic", "cool", "warm", "monochrome"];

export const TUNING = {
    // Feature extraction
    bassThreshold: 250,
    onsetThreshold: 0.03,
    onsetMultiplier: 1.3,
    energyHistorySize: 43,

    // Smoothing
    flatnessSmoothing: 0.1,
    centroidSmoothing: 0.1,
    hueLerp: 0.05,
    baseHueLerp: 0.1,
    warmthLerp: 0.05,
    onsetDecay: 0.92,
    beatDensityDecay: 0.98,
    beatDensityImpulse: 0.8,

    // Warmth weighting
    warmthWeights: {energy: 0.3, rhythm: 0.5, bass: 0.2},
    energyNormalizer: 0.15,
    bassNormalizer: 0.1,

    // Standby
    idleEnergyBase: 0.08,
    idleEnergyAmplitude: 0.05,
    idleEnergyLerp: 0.02,
    idleBassTarget: 0.02,
    idleBassLerp: 0.02,
    idleOnsetDecay: 0.9,
    idleBeatDensityDecay: 0.95,
    idleHueDrift: 0.1,
    idleWarmthDecay: 0.95,

    // Rendering defaults
    particlesMax: 300,
    spectrumBars: 64,
    radialInnerRatio: 0.2,
};
