import {TUNING} from '../constants.js';

// Precompute trig tables
let cachedNumBars = 0;
let cosTable = null;
let sinTable = null;

const precomputeTrigTable = (n) => {
    if (n === cachedNumBars) return;
    cosTable = new Float32Array(n);
    sinTable = new Float32Array(n);
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
        cosTable[i] = Math.cos(i * step);
        sinTable[i] = Math.sin(i * step);
    }
    cachedNumBars = n;
};

export const renderRadial = (dataArray, ctx, s, w, h, config) => {
    const centerX = w / 2;
    const centerY = h / 2;

    const innerRatio = config.radialInnerRatio || TUNING.radialInnerRatio;
    const innerRadius = (h * innerRatio) + (s.energy * 100);

    const numBars = dataArray.length / 2;
    const angleStep = (Math.PI * 2) / numBars;
    precomputeTrigTable(numBars);

    const isMonochrome = config.colorScheme === 'monochrome';
    const saturation = isMonochrome ? 20 : 80;
    const barWidth = (innerRadius * angleStep) * 0.8;

    for (let i = 0; i < numBars; i++) {
        const norm = dataArray[i] / 255;
        const barHeight = norm * (h * 0.3) * (1 + s.onset);

        const hue = isMonochrome
            ? s.hue
            : (s.hue + (i / numBars) * 100) % 360;

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, 60%, ${0.3 + norm * 0.7})`;

        // Position and rotate using precomputed trig without save/restore.
        const cx = centerX + cosTable[i] * innerRadius;
        const cy = centerY + sinTable[i] * innerRadius;
        ctx.setTransform(cosTable[i], sinTable[i], -sinTable[i], cosTable[i], cx, cy);
        ctx.fillRect(barWidth / 2, -barHeight / 2, barWidth, barHeight);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawCenterPulse(ctx, s, centerX, centerY, innerRadius, isMonochrome);
};

const drawCenterPulse = (ctx, s, x, y, r, isMonochrome) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const saturation = isMonochrome ? 30 : 100;
    ctx.strokeStyle = `hsla(${s.hue}, ${saturation}%, 70%, ${0.4 + s.onset * 0.6})`;
    ctx.lineWidth = 3 + s.onset * 10;
    ctx.stroke();
};
