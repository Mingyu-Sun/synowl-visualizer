export const initialState = {
    energy: 0,
    bass: 0,
    centroid: 0,
    flatness: 0,
    onset: 0,
    hue: 200,
    lastEnergy: 0
};

export const smoothFeatures = (state, raw) => {
    state.lastEnergy = raw.energy;

    // 0.1 = smooth/slow, 0.3 = fast/snappy
    state.energy += (raw.energy - state.energy) * 0.12;
    state.bass += (raw.bass - state.bass) * 0.2;
    state.flatness += (raw.flatness - state.flatness) * 0.1;

    // Logarithmic Hue mapping (100Hz - 10kHz mapped to 0-360)
    if (raw.centroid > 0) {
        const targetHue = (Math.log2(raw.centroid / 100) * 60) % 360;
        state.hue += (targetHue - state.hue) * 0.05;
    }

    if (raw.isOnset) state.onset = 1.0;
    else state.onset *= 0.92; // Decay factor
};