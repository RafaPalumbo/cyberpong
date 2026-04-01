// canvas/ctx live here so all modules can import them without creating a
// dependency on game.js (which imports from everyone).
import { GAME_STATE } from './data.js';
import { state } from './state.js';
import { player, enemy } from './entities.js';
import { drawParticles } from './particles.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const gameContainer = document.getElementById('gameContainer');

export let shakeTime = 0;

export function screenShake(intensity) {
    shakeTime = intensity;
}

export function draw() {
    ctx.fillStyle = '#050505';

    let sx = 0;
    let sy = 0;

    if (shakeTime > 0) {
        sx = (Math.random() - 0.5) * shakeTime;
        sy = (Math.random() - 0.5) * shakeTime;
        shakeTime *= 0.9;
        if (shakeTime < 0.5) shakeTime = 0;
    }

    ctx.save();
    ctx.translate(sx, sy);

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < canvas.width; i += 40) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }

    for (let i = 0; i < canvas.height; i += 40) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }

    ctx.stroke();

    if (state.currentState === GAME_STATE.MENU || state.currentState === GAME_STATE.BATTLE_SELECT) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        for (let i = 0; i < 3; i++)
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
    }

    ctx.strokeStyle = '#222';
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    if (
        state.currentState === GAME_STATE.PLAYING ||
        state.currentState === GAME_STATE.STORY ||
        state.currentState === GAME_STATE.PROLOGUE ||
        state.isPaused
    ) {
        drawPaddle(player);

        if (state.currentState !== GAME_STATE.PROLOGUE && enemy.alpha > 0.05) {
            ctx.globalAlpha = enemy.alpha;
            drawPaddle(enemy);
            ctx.globalAlpha = 1.0;
        }
    }

    state.balls.forEach(b => b.draw());
    drawParticles();

    ctx.restore();
}

export function drawPaddle(actor) {
    ctx.save();

    const dir = actor === player ? 1 : -1;

    if (actor.swingCooldown > 10) {
        const p = (actor.swingCooldown - 10) / 10;

        ctx.beginPath();
        ctx.moveTo(actor.x, actor.y);

        const radius = 75;
        const spread = Math.PI / 1.4;
        const baseAngle = dir === 1 ? 0 : Math.PI;

        ctx.arc(actor.x + (15 * dir), actor.y, radius, baseAngle - spread / 2, baseAngle + spread / 2);
        ctx.closePath();

        const grad = ctx.createRadialGradient(actor.x, actor.y, 10, actor.x, actor.y, radius);
        grad.addColorStop(0, actor.color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.7 * p * (actor.alpha || 1);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = actor.color;

    if (actor.damageFlash > 0) {
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#fff";
    } else {
        ctx.fillStyle = actor.color;
    }

    if (actor.swingActiveFrames > 0) ctx.shadowBlur = 35;

    const w = actor.w;
    const h = actor.h;
    const x = actor.x - w / 2;
    const y = actor.y - h / 2;

    ctx.fillRect(x, y + 5, w, h - 10);
    ctx.fillRect(x - (5 * dir), y + 15, w + (5 * dir), 10);
    ctx.fillRect(x - (5 * dir), y + h - 25, w + (5 * dir), 10);

    ctx.fillStyle = '#000';
    ctx.fillRect(x + (dir === 1 ? 12 : 4), y + h / 2 - 15, 8, 30);

    ctx.fillStyle = actor.damageFlash > 0 ? '#f00' : '#fff';
    ctx.fillRect(x + (dir === 1 ? 14 : 6), y + h / 2 - 5, 4, 10);

    ctx.restore();
}
