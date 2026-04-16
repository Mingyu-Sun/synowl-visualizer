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
};

export const defaultConfig = {
    energySmoothing: 0.12,
    bassSmoothing: 0.2,
    colorScheme: 'dynamic',
    baseHue: 200,
};

export const smoothFeatures = (state, raw, isCapturing, config = defaultConfig) => {
    state.phase += 0.01; // Constant time-based counter

    if (isCapturing && raw) {
        // --- ACTIVE MODE ---
        state.energy += (raw.energy - state.energy) * config.energySmoothing;
        state.bass += (raw.bass - state.bass) * config.bassSmoothing;
        state.flatness += (raw.flatness - state.flatness) * 0.1;
        state.centroid += (raw.centroid - state.centroid) * 0.1;

        if (raw.isOnset) {
            state.beatDensity = Math.min(state.beatDensity + 0.8, 1.0);
        } else {
            state.beatDensity *= 0.98;
        }

        const energyScore = Math.min(raw.energy / 0.15, 1);
        const bassScore = Math.min(raw.bass / 0.1, 1);
        const rhythmScore = state.beatDensity;

        const targetWarmth = (energyScore * 0.3 + rhythmScore * 0.5 + bassScore * 0.2);
        state.warmth += (targetWarmth - state.warmth) * 0.05;

        // Color scheme
        if (config.colorScheme === 'dynamic') {
            const targetHue = 200 - (200 * state.warmth);
            state.hue += (targetHue - state.hue) * 0.05;
        } else if (config.colorScheme === 'cool') {
            const targetHue = 180 + (80 * (1 - state.warmth)); // 180-260
            state.hue += (targetHue - state.hue) * 0.05;
        } else if (config.colorScheme === 'warm') {
            const targetHue = 60 * state.warmth; // 0-60
            state.hue += (targetHue - state.hue) * 0.05;
        } else if (config.colorScheme === 'monochrome') {
            state.hue += (config.baseHue - state.hue) * 0.1;
        }

        if (raw.isOnset) state.onset = 1.0;
        else state.onset *= 0.92;

        state.lastEnergy = raw.energy;
    } else {
        // --- STANDBY MODE: Gradual return to calm ---
        const breathing = 0.08 + Math.sin(state.phase) * 0.05;

        state.energy += (breathing - state.energy) * 0.02;
        state.bass += (0.02 - state.bass) * 0.02;
        state.onset *= 0.9;
        state.beatDensity *= 0.95;
        state.hue = (state.hue + 0.1) % 360;
        state.warmth *= 0.95;
    }
};
