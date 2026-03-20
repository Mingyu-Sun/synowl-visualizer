export const visualize = (dataArray, ctx, s, w, h) => {
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(0, 0, w, h);

    const barWidth = (w / dataArray.length) * 2.5;
    let x = 0;

    // Draw Bars
    for (let i = 0; i < dataArray.length; i++) {
        const norm = dataArray[i] / 255;
        const barHeight = norm * (h * 0.4);

        const hue = (s.hue + (i / dataArray.length) * 200) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.2 + norm * 0.5})`;
        ctx.fillRect(x, (h - barHeight) / 2, barWidth - 1, barHeight);

        x += barWidth;
    }

    // Draw Center Pulse
    ctx.beginPath();
    const pulseScale = Math.pow(s.energy, 1.2);
    const radius = (h * 0.15) + (pulseScale * 250) + (s.bass * 50);

    ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${s.hue}, 100%, 70%, ${0.4 + s.onset * 0.6})`;
    ctx.lineWidth = 2 + s.onset * 15;
    ctx.stroke();
}