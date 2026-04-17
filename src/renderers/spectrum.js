export const renderSpectrum = (dataArray, ctx, s, w, h, config) => {
    const isMonochrome = config.colorScheme === 'monochrome';

    const barCount = 64;
    const bars = groupBinsLog(dataArray, barCount);

    const barWidth = w / barCount;
    const maxBarHeight = h * 0.75;
    const baseline = h * 0.85;

    for (let i = 0; i < barCount; i++) {
        const norm = bars[i];
        const barHeight = norm * maxBarHeight * (1 + s.onset * 0.3);

        const x = i * barWidth;
        const y = baseline - barHeight;

        const hue = isMonochrome
            ? s.hue
            : (s.hue + (i / barCount) * 120) % 360;
        const saturation = isMonochrome ? 20 : 80;
        const lightness = 50 + norm * 20;

        // Bar
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.4 + norm * 0.6})`;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

        // Top cap
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, 80%, ${0.6 + norm * 0.4})`;
        ctx.fillRect(x + 1, y, barWidth - 2, 2);
    }

    // --- Baseline ---
    ctx.fillStyle = `hsla(${s.hue}, 30%, 50%, 0.15)`;
    ctx.fillRect(0, baseline, w, 1);
};

const groupBinsLog = (dataArray, barCount) => {
    const len = dataArray.length;
    const bars = new Float32Array(barCount);

    for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency bin range logarithmically
        const startFrac = Math.pow(i / barCount, 2);
        const endFrac = Math.pow((i + 1) / barCount, 2);
        const startBin = Math.floor(startFrac * len);
        const endBin = Math.max(startBin + 1, Math.floor(endFrac * len));

        let sum = 0;
        let count = 0;
        for (let j = startBin; j < endBin && j < len; j++) {
            sum += dataArray[j] / 255;
            count++;
        }
        bars[i] = count > 0 ? sum / count : 0;
    }

    return bars;
};
