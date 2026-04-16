export const visualize = (dataArray, ctx, s, w, h, config = {}) => {
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    // Base radius
    const innerRadius = (h * 0.2) + (s.energy * 100);

    // Draw radial bars
    const numBars = dataArray.length / 2; // only use the audible range
    const angleStep = (Math.PI * 2) / numBars;

    const isMonochrome = config.colorScheme === 'monochrome';

    for (let i = 0; i < numBars; i++) {
        const norm = dataArray[i] / 255;
        const barHeight = norm * (h * 0.3) * (1 + s.onset);

        const angle = i * angleStep;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        const hue = isMonochrome
            ? s.hue
            : (s.hue + (i / numBars) * 100) % 360;
        const saturation = isMonochrome ? 20 : 80;
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, 60%, ${0.3 + norm * 0.7})`;

        const barWidth = (innerRadius * angleStep) * 0.8;
        ctx.fillRect(barWidth / 2, innerRadius - barHeight / 2, barWidth, barHeight);

        ctx.restore();
    }

    drawCenterPulse(ctx, s, centerX, centerY, innerRadius, isMonochrome);
}

const drawCenterPulse = (ctx, s, x, y, r, isMonochrome = false) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const saturation = isMonochrome ? 30 : 100;
    ctx.strokeStyle = `hsla(${s.hue}, ${saturation}%, 70%, ${0.4 + s.onset * 0.6})`;
    ctx.lineWidth = 3 + s.onset * 10;
    ctx.stroke();
}
