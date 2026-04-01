import { state } from './state.js';
import { enemy } from './entities.js';
import { canvas } from './renderer.js';
import { createExplosion, spawnFloatingText } from './particles.js';
import { startSwing, clamp } from './physics.js';

export function enemyAI() {
    if (state.gameMode === 'pvp') return;

    const stealth = (enemy.ability === "stealth" || enemy.ability === "all");

    if (stealth) {
        if (enemy.invisTimer <= 0 && Math.random() < 0.02) enemy.invisTimer = 60;

        if (enemy.invisTimer > 0) {
            enemy.invisTimer--;
            enemy.alpha = Math.max(0, enemy.alpha - 0.1);
        } else {
            enemy.alpha = Math.min(1, enemy.alpha + 0.1);
        }
    } else {
        enemy.alpha = 1;
    }

    let targetBall = null;
    let minDist = Infinity;

    state.balls.forEach(b => {
        if (b.vx > 0) {
            const dist = enemy.x - b.x;
            if (dist < minDist) {
                minDist = dist;
                targetBall = b;
            }
        }
    });

    if (!targetBall && state.balls.length > 0) targetBall = state.balls[0];

    let targetY = targetBall ? targetBall.y : canvas.height / 2;

    if (targetBall && targetBall.vx > 15) {
        targetY += Math.sin(Date.now() / 100) * enemy.aiError;
    }

    let moveSpeed = enemy.speed;

    const burst = (enemy.ability === "speed_burst" || enemy.ability === "all");

    if (enemy.burstTimer > 0) enemy.burstTimer--;

    if (burst && targetBall) {
        const distY = Math.abs(enemy.y - targetY);
        if (distY > 80 && enemy.burstTimer === 0) {
            moveSpeed *= 4;
            enemy.burstTimer = 40;

            spawnFloatingText("DASH!", enemy.x, enemy.y - 40, enemy.color);
            createExplosion(enemy.x, enemy.y, enemy.color, 5);
        }
    }

    if (enemy.y < targetY - 15) enemy.y += moveSpeed;
    else if (enemy.y > targetY + 15) enemy.y -= moveSpeed;

    clamp(enemy);

    if (targetBall &&
        targetBall.vx > 0 &&
        targetBall.x > enemy.x - 120 &&
        Math.abs(targetBall.y - enemy.y) < 70) {

        if (enemy.swingCooldown === 0) {
            let chance = 0.3;

            if (enemy.ability === "god_mode" || enemy.ability === "all") chance = 0.95;
            if (enemy.aiError < 10) chance = 0.8;
            if (targetBall.x > enemy.x - 50) chance += 0.5;

            if (Math.random() < chance) startSwing(enemy);
        }
    }
}
