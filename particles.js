import { state } from './state.js';
import { ctx } from './renderer.js';

export const particles = [];

export function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 1.0,
            color: color,
            text: null
        });
    }
}

export function spawnFloatingText(text, x, y, color) {
    particles.push({
        x: x,
        y: y,
        vx: 0,
        vy: -2,
        life: 1.0,
        color: color,
        text: text,
        size: 24
    });
}

export function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * state.timeScale;
        p.y += p.vy * state.timeScale;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

export function drawParticles() {
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        if (p.text) {
            ctx.font = `bold ${p.size}px Courier New`;
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText(p.text, p.x, p.y);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillRect(p.x, p.y, 4, 4);
        }
    }
    ctx.globalAlpha = 1;
}
