const pool = [];
const MAX_PARTICLES = 300;

export const renderParticles = (dataArray, ctx, s, w, h, config) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const isMonochrome = config.colorScheme === 'monochrome';

    // --- Spawn new particles ---
    const spawnCount = Math.floor(s.energy * 8 + s.onset * 15);
    for (let i = 0; i < spawnCount && pool.length < MAX_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3 + s.onset * 4;
        const hue = isMonochrome
            ? s.hue
            : (s.hue + Math.random() * 80 - 40 + 360) % 360;

        pool.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.008 + Math.random() * 0.015,
            size: 2 + Math.random() * 3 + s.onset * 2,
            hue,
            saturation: isMonochrome ? 20 : 70 + Math.random() * 20,
        });
    }

    // --- Update and render ---
    for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.985;
        p.vy *= 0.985;

        p.life -= p.decay;

        if (p.life <= 0) {
            pool.splice(i, 1);
            continue;
        }

        // Draw
        const alpha = p.life * (0.5 + s.energy * 0.5);
        const size = p.size * (0.5 + p.life * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 65%, ${alpha})`;
        ctx.fill();
    }

    // --- Center glow ---
    const glowRadius = 8 + s.energy * 30 + s.onset * 20;
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowRadius
    );
    const saturation = isMonochrome ? 20 : 80;
    gradient.addColorStop(0, `hsla(${s.hue}, ${saturation}%, 70%, ${0.4 + s.onset * 0.4})`);
    gradient.addColorStop(1, `hsla(${s.hue}, ${saturation}%, 60%, 0)`);

    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
};
