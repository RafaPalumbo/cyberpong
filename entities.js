import { state } from './state.js';
import { createExplosion } from './particles.js';
import { canvas, ctx } from './renderer.js';

export const player = {
    x: 50,
    y: 300,
    w: 24,
    h: 80,
    color: '#0ff',
    speed: 0,
    hp: 100,
    maxHp: 100,
    energy: 0,
    swingCooldown: 0,
    swingActiveFrames: 0,
    damageFlash: 0
};

export const enemy = {
    x: 730,
    y: 300,
    w: 24,
    h: 80,
    color: '#f0f',
    name: "BOT",
    speed: 4,
    baseSpeed: 4,
    hp: 100,
    maxHp: 100,
    swingCooldown: 0,
    swingActiveFrames: 0,
    damageFlash: 0,
    ability: null,
    invisTimer: 0,
    alpha: 1.0,
    burstTimer: 0
};

export class Ball {
    constructor(x, y, speed, vx) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.baseSpeed = speed;
        this.speed = speed;
        this.maxSpeed = 35;
        this.vx = vx;
        this.vy = (Math.random() * 8) - 4;
        this.active = true;
        this.trail = [];
        this.color = '#fff';
    }

    update() {
        let s = state.timeScale;
        if (Math.abs(this.vx) < 3) this.vx = (this.vx >= 0 ? 1 : -1) * 3;

        this.x += this.vx * s;
        this.y += this.vy * s;

        if (this.y - this.radius <= 0) {
            this.y = this.radius + 1;
            this.vy = Math.abs(this.vy);
            createExplosion(this.x, this.y, "#fff", 3);
            if (Math.abs(this.vx) < 5) this.vx *= 1.2;
        } else if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius - 1;
            this.vy = -Math.abs(this.vy);
            createExplosion(this.x, this.y, "#fff", 3);
            if (Math.abs(this.vx) < 5) this.vx *= 1.2;
        }

        if (s > 0.5) {
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > 10) this.trail.shift();
        }
    }

    draw() {
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const size = this.radius * (i / this.trail.length);
            ctx.fillStyle = `rgba(255,255,255,${0.3 * (i / this.trail.length)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.speed > 15 ? '#ff9' : this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
