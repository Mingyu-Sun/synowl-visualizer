import {TUNING} from './constants.js';

export const initialState = {
    energy: 0.05,
    bass: 0.02,
    centroid: 400,
    flatness: 0.1,
    onset: 0,
    hue: 200,
    lastEnergy: 0,
    phase: 0,
    warmth: 0, // 0 (Cold) to 1 (Warm)
    beatDensity: 0,
    energyHistory: new Float32Array(TUNING.energyHistorySize),
    energyHistoryIdx: 0,
};

export const defaultConfig = {
    energySmoothing: 0.12,
    bassSmoothing: 0.2,
    colorScheme: 'dynamic',
    baseHue: 200,
    visualizationMode: 'radial',
};

const pushHistory = (state, e) => {
    state.energyHistory[state.energyHistoryIdx] = e;
    state.energyHistoryIdx =
        (state.energyHistoryIdx + 1) % state.energyHistory.length;
};

const historyMean = (state) => {
    const h = state.energyHistory;
    let s = 0;
    for (let i = 0; i < h.length; i++) s += h[i];
    return s / h.length;
};

const detectOnset = (state, raw) => {
    const localAvg = historyMean(state);
    const ratioSpike =
        localAvg > 0 &&
        raw.energy > localAvg * TUNING.onsetMultiplier &&
        (raw.energy - state.lastEnergy) > (TUNING.onsetThreshold * 0.66);
    return raw.isOnset || ratioSpike;
};

const palettes = {
    dynamic:    (warmth) => 200 - 200 * warmth,
    cool:       (warmth) => 180 + 80 * (1 - warmth),
    warm:       (warmth) => 60 * warmth,
    monochrome: (_warmth, base) => base,
};

const getTargetHue = (schemeName, warmth, baseHue) => {
    const fn = palettes[schemeName] || palettes.dynamic;
    return fn(warmth, baseHue);
};

export const smoothFeatures = (state, raw, isCapturing, config = defaultConfig) => {
    state.phase += 0.01; // Constant time-based counter

    if (isCapturing && raw) {
        // --- ACTIVE MODE ---
        state.energy += (raw.energy - state.energy) * config.energySmoothing;
        state.bass += (raw.bass - state.bass) * config.bassSmoothing;
        state.flatness += (raw.flatness - state.flatness) * TUNING.flatnessSmoothing;
        state.centroid += (raw.centroid - state.centroid) * TUNING.centroidSmoothing;

        const onset = detectOnset(state, raw);
        pushHistory(state, raw.energy);

        if (onset) {
            state.beatDensity = Math.min(
                state.beatDensity + TUNING.beatDensityImpulse,
                1.0
            );
        } else {
            state.beatDensity *= TUNING.beatDensityDecay;
        }

        const energyScore = Math.min(raw.energy / TUNING.energyNormalizer, 1);
        const bassScore = Math.min(raw.bass / TUNING.bassNormalizer, 1);
        const rhythmScore = state.beatDensity;

        const w = TUNING.warmthWeights;
        const targetWarmth =
            energyScore * w.energy +
            rhythmScore * w.rhythm +
            bassScore * w.bass;
        state.warmth += (targetWarmth - state.warmth) * TUNING.warmthLerp;

        // Color scheme
        const targetHue = getTargetHue(config.colorScheme, state.warmth, config.baseHue);
        const lerp = config.colorScheme === 'monochrome'
            ? TUNING.baseHueLerp
            : TUNING.hueLerp;
        state.hue += (targetHue - state.hue) * lerp;

        if (onset) state.onset = 1.0;
        else state.onset *= TUNING.onsetDecay;

        state.lastEnergy = raw.energy;
    } else {
        // --- STANDBY MODE: Gradual return to calm ---
        const breathing =
            TUNING.idleEnergyBase + Math.sin(state.phase) * TUNING.idleEnergyAmplitude;

        state.energy += (breathing - state.energy) * TUNING.idleEnergyLerp;
        state.bass += (TUNING.idleBassTarget - state.bass) * TUNING.idleBassLerp;
        state.onset *= TUNING.idleOnsetDecay;
        state.beatDensity *= TUNING.idleBeatDensityDecay;
        state.hue = (state.hue + TUNING.idleHueDrift) % 360;
        state.warmth *= TUNING.idleWarmthDecay;
    }
};
