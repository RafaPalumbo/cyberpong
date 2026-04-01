import { state } from './state.js';
import { GAME_STATE } from './data.js';
import { player, enemy } from './entities.js';
import { canvas, gameContainer } from './renderer.js';
import { draw } from './renderer.js';
import { spawnBall, checkSwingHit, takeDamage, clamp, activateSpecial, startSwing } from './physics.js';
import { enemyAI } from './ai.js';
import { updateParticles } from './particles.js';
import { togglePause } from './ui.js';
import { initAudio, playOverdrive } from './audio.js';

// ─── resize ───────────────────────────────────────────────────────────────────

let scaleFactor = 1;

function resizeGame() {
    const scaleX = window.innerWidth / 800;
    const scaleY = window.innerHeight / 600;
    scaleFactor = Math.min(scaleX, scaleY) * 0.95;
    gameContainer.style.transform = `scale(${scaleFactor})`;
}

window.addEventListener('resize', resizeGame);
resizeGame();

// ─── pointer lock ─────────────────────────────────────────────────────────────

canvas.addEventListener('click', () => {
    if (state.currentState === GAME_STATE.PLAYING && !state.isPaused) {
        canvas.requestPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        document.addEventListener('mousemove', onLockedMove);
    } else {
        document.removeEventListener('mousemove', onLockedMove);
        if (state.currentState === GAME_STATE.PLAYING && !state.isPaused) {
            togglePause();
        }
    }
});

function onLockedMove(e) {
    if (state.currentState !== GAME_STATE.PLAYING || state.isPaused) return;
    state.mouseY += e.movementY / scaleFactor;
    state.mouseY = Math.max(player.h / 2, Math.min(canvas.height - player.h / 2, state.mouseY));
}

// ─── input ────────────────────────────────────────────────────────────────────

const keys = {};
const KB_SPEED = 6;
let audioReady = false;

function ensureAudio() {
    if (!audioReady) { initAudio(); audioReady = true; }
}

canvas.addEventListener('mousemove', e => {
    if (document.pointerLockElement === canvas) return;
    const rect = gameContainer.getBoundingClientRect();
    const raw = (e.clientY - rect.top) / scaleFactor;
    state.mouseY = Math.max(player.h / 2, Math.min(canvas.height - player.h / 2, raw));
});

canvas.addEventListener('mousedown', e => {
    ensureAudio();
    if (state.currentState === GAME_STATE.PLAYING && !state.isPaused) {
        if (e.target.id !== 'pause-btn') startSwing(player);
    }
});

document.addEventListener('keydown', e => {
    ensureAudio();
    keys[e.code] = true;
    if (e.code === 'Space' && state.currentState === GAME_STATE.PLAYING && !state.isPaused) {
        if (player.energy >= 100) playOverdrive();
        activateSpecial();
    }
    if (e.code === 'Escape') togglePause();
    if (['ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
});

document.addEventListener('keyup', e => { keys[e.code] = false; });

// ─── game round ───────────────────────────────────────────────────────────────

export function resetGameRound() {
    state.balls = [];
    spawnBall(1);
    state.timeScale = 1.0;
}

// ─── update ───────────────────────────────────────────────────────────────────

function update() {
    if (state.currentState !== GAME_STATE.PLAYING || state.isPaused) return;

    if (state.gameMode === 'pvp') {
        if (keys['KeyW']) state.mouseY = Math.max(player.h / 2, state.mouseY - KB_SPEED);
        if (keys['KeyS']) state.mouseY = Math.min(canvas.height - player.h / 2, state.mouseY + KB_SPEED);
    } else {
        if (keys['KeyW'] || keys['ArrowUp'])   state.mouseY = Math.max(player.h / 2, state.mouseY - KB_SPEED);
        if (keys['KeyS'] || keys['ArrowDown']) state.mouseY = Math.min(canvas.height - player.h / 2, state.mouseY + KB_SPEED);
    }

    player.y += (state.mouseY - player.y) * 0.25;
    clamp(player);

    if (state.gameMode === 'pvp') {
        if (keys['ArrowUp'])   enemy.y = Math.max(enemy.h / 2, enemy.y - 6);
        if (keys['ArrowDown']) enemy.y = Math.min(canvas.height - enemy.h / 2, enemy.y + 6);
        clamp(enemy);
        if (keys['KeyL'] && enemy.swingCooldown === 0) startSwing(enemy);
    }

    if (keys['KeyF'] && state.gameMode === 'pvp' && player.swingCooldown === 0) startSwing(player);

    enemyAI();

    if (player.swingActiveFrames > 0) {
        checkSwingHit(player);
        player.swingActiveFrames--;
    }

    if (enemy.swingActiveFrames > 0) {
        checkSwingHit(enemy);
        enemy.swingActiveFrames--;
    }

    if (player.swingCooldown > 0) player.swingCooldown--;
    if (enemy.swingCooldown > 0) enemy.swingCooldown--;

    if (player.damageFlash > 0) player.damageFlash--;
    if (enemy.damageFlash > 0) enemy.damageFlash--;

    for (let i = state.balls.length - 1; i >= 0; i--) {
        const b = state.balls[i];
        b.update();

        if (b.x < -20) {
            takeDamage(player);
            state.balls.splice(i, 1);
        } else if (b.x > canvas.width + 20) {
            takeDamage(enemy);
            state.balls.splice(i, 1);
        }
    }

    if (state.balls.length === 0 && player.hp > 0 && enemy.hp > 0) resetGameRound();

    updateParticles();
}

// ─── loop ─────────────────────────────────────────────────────────────────────

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);