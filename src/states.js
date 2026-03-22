export const initialState = {
    energy: 0.05,
    bass: 0.02,
    centroid: 400,
    flatness: 0.1,
    onset: 0,
    hue: 200,
    lastEnergy: 0,
    phase: 0
};

export const smoothFeatures = (state, raw, isCapturing) => {
    state.phase += 0.01; // Constant time-based counter

    if (isCapturing && raw) {
        // --- ACTIVE MODE ---
        state.energy += (raw.energy - state.energy) * 0.12;
        state.bass += (raw.bass - state.bass) * 0.2;

        const targetHue = raw.centroid > 0 ? (Math.log2(raw.centroid / 100) * 60) % 360 : state.hue;
        state.hue += (targetHue - state.hue) * 0.05;

        if (raw.isOnset) state.onset = 1.0;
        else state.onset *= 0.92;

        state.lastEnergy = raw.energy;
    } else {
        // --- STANDBY MODE: Gradual return to calm ---
        const breathing = 0.08 + Math.sin(state.phase) * 0.05;

        state.energy += (breathing - state.energy) * 0.02;
        state.bass += (0.02 - state.bass) * 0.02;
        state.onset *= 0.9;
        state.hue = (state.hue + 0.1) % 360;
    }
};