export const visualize = (dataArray, ctx, s, w, h) => {
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    // Base radius
    const innerRadius = (h * 0.15) + (s.energy * 100);

    // Draw radial bars
    const numBars = dataArray.length / 2; // only use the audible range
    const angleStep = (Math.PI * 2) / numBars;

    for (let i = 0; i < numBars; i++) {
        const norm = dataArray[i] / 255;
        const barHeight = norm * (h * 0.3) * (1 + s.onset);

        const angle = i * angleStep;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        const hue = (s.hue + (i / numBars) * 100) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + norm * 0.7})`;

        const barWidth = (innerRadius * angleStep) * 0.8;
        ctx.fillRect(barWidth / 2, innerRadius - barHeight / 2, barWidth, barHeight);

        ctx.restore();
    }

    drawCenterPulse(ctx, s, centerX, centerY, innerRadius);
}

const drawCenterPulse = (ctx, s, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${s.hue}, 100%, 70%, ${0.4 + s.onset * 0.6})`;
    ctx.lineWidth = 2 + s.onset * 15;
    ctx.stroke();
}
