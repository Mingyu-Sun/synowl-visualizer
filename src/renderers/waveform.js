export const renderWaveform = (dataArray, ctx, s, w, h, config, timeDomainData) => {
    const centerX = w / 2;
    const centerY = h / 2;

    const isMonochrome = config.colorScheme === "monochrome";
    const baseRadius = (h * 0.15) + (s.energy * 60);
    const maxAmplitude = h * 0.1;

    const data = timeDomainData || dataArray;
    const len = data.length;

    // --- Waveform ring ---
    ctx.beginPath();
    for (let i = 0; i <= len; i++) {
        const idx = i % len;
        const norm = (data[idx] - 128) / 128;
        const r = baseRadius + norm * maxAmplitude * (1 + s.onset * 0.2);

        const angle = (idx / len) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    const hue = s.hue;
    const saturation = isMonochrome ? 20 : 80;

    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 65%, ${0.6 + s.onset * 0.4})`;
    ctx.lineWidth = 2 + s.onset * 3;
    ctx.stroke();

    // --- Glow layer ---
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 60%, ${0.1 + s.energy * 0.15})`;
    ctx.lineWidth = 5 + s.onset * 5;
    ctx.stroke();
};
