import { state } from './state.js';
import { GAME_STATE } from './data.js';
import { player, enemy, Ball } from './entities.js';
import { canvas } from './renderer.js';
import { screenShake } from './renderer.js';
import { createExplosion, spawnFloatingText } from './particles.js';
import { updateUI, handleGameOver } from './ui.js';
import { resetGameRound } from './game.js';
import { playHit, playPerfect, playPoint } from './audio.js';

export function spawnBall(direction, x = null, y = null) {
    const sx = x !== null ? x : canvas.width / 2;
    const sy = y !== null ? y : canvas.height / 2;

    const speed = 7 + (state.currentLevelIndex * 0.5);
    const vx = direction * speed;

    state.balls.push(new Ball(sx, sy, speed, vx));
    createExplosion(sx, sy, '#fff', 10);
}

export function startSwing(actor) {
    if (actor.swingCooldown < 5) {
        actor.swingCooldown = 20;
        actor.swingActiveFrames = 10;
    }
}

export function checkSwingHit(actor) {
    let reachFront = 80;
    let dynamicBack = 20;
    let reachVertical = actor.h / 2 + 45;

    if (actor === enemy && enemy.name === "TANK MK-V") {
        reachVertical += 30;
        reachFront += 30;
    }

    let hitXMin, hitXMax;

    if (actor === player) {
        hitXMin = actor.x - dynamicBack;
        hitXMax = actor.x + reachFront;
    } else {
        hitXMin = actor.x - reachFront;
        hitXMax = actor.x + dynamicBack;
    }

    let hitSomething = false;

    for (let i = state.balls.length - 1; i >= 0; i--) {
        const b = state.balls[i];

        const padding = Math.abs(b.vx) * 0.5;

        const inX = b.x >= (hitXMin - padding) && b.x <= (hitXMax + padding);
        const inY = Math.abs(b.y - actor.y) < reachVertical;

        if (inX && inY) {
            const movingAway =
                (actor === player && b.vx > 0) ||
                (actor === enemy && b.vx < 0);

            if (!movingAway || Math.abs(b.x - actor.x) < 30) {
                resolveHit(actor, b);
                hitSomething = true;
            }
        }
    }

    return hitSomething;
}

export function resolveHit(actor, b) {
    actor.swingActiveFrames = 0;

    const dir = actor === player ? 1 : -1;
    const sweetSpotX = actor === player ? actor.x + 30 : actor.x - 30;

    const relativeIntersectY = (actor.y - b.y);
    const normalized = (relativeIntersectY / (actor.h / 2));
    const bounceAngle = Math.max(-1.2, Math.min(1.2, normalized * (Math.PI / 3.5)));

    let color = "#fff";
    let speedBoost = 1.0;

    const heavy = (actor === enemy && (enemy.ability === 'heavy_hit' || enemy.ability === 'all'));
    if (heavy) {
        speedBoost = enemy.isFinalBoss ? 4.0 : 2.0;
        color = "#ff8800";
        screenShake(5);
    }

    const multiball = (actor === enemy && (enemy.ability === 'multiball' || enemy.ability === 'all'));
    if (multiball) {
        if (enemy.isFinalBoss) {
            if (state.balls.length < 3 && Math.random() < 0.15) {
                spawnBall(dir, b.x, b.y);
                spawnFloatingText("CLONE!", actor.x, actor.y - 60, "#0f0");
            }
        } else {
            if (state.balls.length < 4 && Math.random() < 0.4) {
                spawnBall(dir, b.x, b.y);
                spawnFloatingText("CLONE!", actor.x, actor.y - 60, "#0f0");
            }
        }
    }

    const perfect = Math.abs(b.x - sweetSpotX) < 30;

    if (perfect) {
        b.speed = Math.min(b.speed * 1.2 + speedBoost, b.maxSpeed);
        color = actor.color;
        createExplosion(b.x, b.y, color, 15);
        screenShake(8);
        state.timeScale = 0.05;
        setTimeout(() => { state.timeScale = 1.0; }, 60);
        if (actor === player) player.energy = Math.min(player.energy + 20, 100);
        spawnFloatingText("PERFECT!", actor.x, actor.y - 50, color);
        playPerfect();
    } else {
        b.speed = Math.min(b.speed + 1.0 + speedBoost, b.maxSpeed);
        createExplosion(b.x, b.y, "#aaa", 5);
        playHit();
    }

    if (b.speed < 10) b.speed = 10;

    b.vx = b.speed * Math.cos(bounceAngle) * dir;
    if (Math.abs(b.vx) < 5) b.vx = 5 * dir;

    b.vy = b.speed * -Math.sin(bounceAngle);
    b.color = color;
}

export function activateSpecial() {
    if (player.energy >= 100) {
        player.energy = 0;

        spawnFloatingText("MAX POWER!", player.x, player.y - 60, "#0ff");

        let used = false;

        state.balls.forEach(b => {
            if (b.vx > 0) {
                b.speed = 35;
                b.vx = 35;
                b.vy = 0;
                b.color = "#0ff";
                used = true;
            }
        });

        if (used) {
            createExplosion(player.x, player.y, "#0ff", 30);
            screenShake(20);
        }
    }
}

export function takeDamage(victim) {
    const dmg = 20;
    victim.hp -= dmg;
    victim.damageFlash = 10;

    screenShake(8);
    createExplosion(victim.x, victim.y, "#f00", 30);
    createExplosion(victim.x, victim.y, victim.color, 15);
    playPoint();

    updateUI();

    if (victim.hp <= 0) {
        handleGameOver(victim === player ? 'enemy' : 'player');
    } else if (state.balls.length === 0) {
        setTimeout(() => {
            if (state.currentState !== GAME_STATE.PLAYING) return;
            if (!state.isPaused) resetGameRound();
        }, 1000);
    }
}

export function clamp(actor) {
    if (actor.y < actor.h / 2) actor.y = actor.h / 2;
    if (actor.y > canvas.height - actor.h / 2) actor.y = canvas.height - actor.h / 2;
}
