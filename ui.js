import { state } from './state.js';
import { GAME_STATE, CAMPAIGN_LEVELS, PROLOGUE_DIALOGUE } from './data.js';
import { player, enemy } from './entities.js';
import { resetGameRound } from './game.js';
import { playVictory, playGameOver } from './audio.js';

const ALL_SCREENS = [
    'menu-screen', 'battle-select-screen', 'system-log-screen',
    'story-screen', 'pause-screen', 'result-screen', 'ending-screen'
];

export function setScreen(id, withHud = false) {
    ALL_SCREENS.forEach(s => document.getElementById(s).style.display = 'none');
    document.getElementById('hud').style.display = withHud ? 'block' : 'none';
    if (id) document.getElementById(id).style.display = 'flex';
}

export function saveProgress() {
    localStorage.setItem('cyberpong_level', String(state.currentLevelIndex + 1));
}

export function loadProgress() {
    return parseInt(localStorage.getItem('cyberpong_level') || '0', 10);
}

function continueCampaign() {
    state.gameMode = 'campaign';
    state.currentLevelIndex = loadProgress();
    startSystemLog(state.currentLevelIndex);
}

export function showEndingScreen() {
    state.currentState = GAME_STATE.MENU;
    setScreen('ending-screen');
    const msg = document.getElementById('ending-msg');
    if (msg) msg.innerText = 'UNIT-734 ALCANÇOU A LIBERDADE. O UPLOAD FOI CONCLUÍDO.';
}

export function showMainMenu() {
    state.isPaused = false;
    state.currentState = GAME_STATE.MENU;
    setScreen('menu-screen');

    const savedLevel = loadProgress();
    let continueBtn = document.getElementById('continue-btn');
    if (savedLevel > 0) {
        if (!continueBtn) {
            continueBtn = document.createElement('button');
            continueBtn.id = 'continue-btn';
            continueBtn.className = 'btn';
            continueBtn.onclick = continueCampaign;
            const menuScreen = document.getElementById('menu-screen');
            menuScreen.insertBefore(continueBtn, menuScreen.querySelector('.btn'));
        }
        continueBtn.innerText = `CONTINUAR (NÍVEL ${savedLevel + 1})`;
        continueBtn.style.display = 'inline-block';
    } else if (continueBtn) {
        continueBtn.style.display = 'none';
    }
}
window.showMainMenu = showMainMenu;

export function setupLevel(index, skipStory = false) {
    const lvl = CAMPAIGN_LEVELS[index];

    setScreen(null);
    state.isPaused = false;

    enemy.name = lvl.name;
    enemy.color = lvl.color;
    enemy.hp = lvl.hp;
    enemy.maxHp = lvl.hp;
    enemy.speed = lvl.speed;
    enemy.baseSpeed = lvl.speed;
    enemy.aiError = lvl.aiError;
    enemy.ability = lvl.ability;
    enemy.isFinalBoss = !!lvl.isFinalBoss;
    enemy.alpha = 1.0;
    enemy.burstTimer = 0;

    player.hp = 100;
    player.maxHp = 100;
    player.energy = 0;

    if (skipStory) enterArena();
    else startSystemLog(index);
}

export function startSystemLog(index) {
    state.currentState = GAME_STATE.SYSTEM_LOG;
    setScreen('system-log-screen');
    const content = document.getElementById('log-content');
    content.innerHTML = '';

    const logs = CAMPAIGN_LEVELS[index].systemLog;

    let delay = 0;
    logs.forEach(line => {
        const p = document.createElement('p');
        p.className = 'log-entry';
        p.innerText = line;
        p.style.animationDelay = `${delay}s`;
        content.appendChild(p);
        delay += 0.8;
    });
}

export function advanceSystemLog() {
    const lvl = CAMPAIGN_LEVELS[state.currentLevelIndex];
    state.currentState = GAME_STATE.STORY;
    startDialogueSequence(lvl.dialogue, `NÍVEL ${state.currentLevelIndex + 1}: ${lvl.name}`);
}
window.advanceSystemLog = advanceSystemLog;

export function startDialogueSequence(dialogueArray, title) {
    setScreen('story-screen');
    document.getElementById('level-indicator').innerText = title;

    state.currentDialogueArray = dialogueArray;
    state.currentDialogueIndex = 0;
    state.inputLocked = false;

    showDialogueLine();
}

export function showDialogueLine() {
    if (!state.currentDialogueArray) return;

    if (state.currentDialogueIndex >= state.currentDialogueArray.length) {
        state.inputLocked = true;
        setTimeout(() => {
            if (state.currentState === GAME_STATE.PROLOGUE) setupLevel(0);
            else enterArena();
        }, 100);
        return;
    }

    const line = state.currentDialogueArray[state.currentDialogueIndex];
    const portrait = document.getElementById('dialogue-portrait');
    const name = document.getElementById('speaker-name');
    const text = document.getElementById('speaker-text');

    if (line.speaker.includes("UNIT-734") || line.speaker.includes("VOCÊ")) {
        portrait.innerText = "❖";
        portrait.style.borderColor = "#0ff";
        portrait.style.color = "#0ff";
        name.style.color = "#0ff";
    } else if (line.speaker.includes("SYSTEM")) {
        portrait.innerText = "⚠️";
        portrait.style.borderColor = "#ff0";
        portrait.style.color = "#ff0";
        name.style.color = "#ff0";
    } else {
        const lvl = CAMPAIGN_LEVELS[state.currentLevelIndex] || {};
        portrait.innerText = lvl.icon || "👁️";
        portrait.style.borderColor = lvl.color || "#f00";
        portrait.style.color = lvl.color || "#f00";
        name.style.color = lvl.color || "#f00";
    }

    name.innerText = line.speaker;
    text.innerText = "";

    if (state.typingTimer) clearInterval(state.typingTimer);

    let i = 0;
    state.typingTimer = setInterval(() => {
        text.innerText += line.text[i];
        i++;
        if (i >= line.text.length) clearInterval(state.typingTimer);
    }, 20);
}

export function advanceDialogue() {
    if (state.inputLocked) return;
    if (!state.currentDialogueArray || state.currentDialogueIndex >= state.currentDialogueArray.length) return;

    const line = state.currentDialogueArray[state.currentDialogueIndex];
    const text = document.getElementById('speaker-text');

    if (text.innerText.length < line.text.length) {
        clearInterval(state.typingTimer);
        text.innerText = line.text;
    } else {
        state.currentDialogueIndex++;
        showDialogueLine();
    }
}
window.advanceDialogue = advanceDialogue;

export function enterArena() {
    setScreen(null, true);

    const hp2 = document.getElementById('p2-hp');
    const nameDisp = document.getElementById('enemy-name-display');

    if (hp2 && nameDisp) {
        hp2.style.background = enemy.color;
        hp2.style.boxShadow = `0 0 10px ${enemy.color}`;
        nameDisp.innerText = enemy.name;
        nameDisp.style.color = enemy.color;
    }

    state.currentState = GAME_STATE.PLAYING;
    updateUI();
    resetGameRound();
    state.inputLocked = false;
}
window.enterArena = enterArena;

export function handleGameOver(winner) {
    state.currentState = GAME_STATE.RESULT;
    setScreen('result-screen');

    if (winner === 'player' && state.gameMode === 'campaign') saveProgress();

    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-msg');
    const nextBtn = document.getElementById('next-level-btn');
    const retryBtn = document.getElementById('retry-btn');

    if (winner === 'player') {
        playVictory();
        title.innerText = "VITÓRIA";
        title.style.color = "#0ff";
        msg.innerText = state.gameMode === 'pvp'
            ? 'JOGADOR 1 VENCE!'
            : `Protocolo ${enemy.name} neutralizado.`;

        if (state.gameMode === 'pvp') {
            nextBtn.innerText = "JOGAR NOVAMENTE";
        } else if (state.gameMode === 'battle') {
            nextBtn.innerText = "VOLTAR À SELEÇÃO";
        } else {
            nextBtn.innerText = "ACESSAR PRÓXIMO NÍVEL";
        }
        nextBtn.style.display = 'inline-block';
        retryBtn.style.display = 'none';
    } else {
        playGameOver();
        title.innerText = state.gameMode === 'pvp' ? "JOGADOR 2 VENCE!" : "FALHA CRÍTICA";
        title.style.color = state.gameMode === 'pvp' ? "#f0f" : "#f00";
        msg.innerText = state.gameMode === 'pvp' ? '' : "Unidade 734 formatada.";

        nextBtn.style.display = 'none';
        retryBtn.style.display = 'inline-block';
    }
}

export function updateUI() {
    const p1Pct = Math.max(0, (player.hp / player.maxHp) * 100);
    const p2Pct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

    document.getElementById('p1-hp').style.width = p1Pct + '%';
    document.getElementById('p2-hp').style.width = p2Pct + '%';

    if (player.energy >= 100) {
        document.getElementById('p1-hp').style.boxShadow = "0 0 15px #fff";
        document.getElementById('p1-hp').style.background = "#fff";
    } else {
        document.getElementById('p1-hp').style.boxShadow = "0 0 5px #0ff";
        document.getElementById('p1-hp').style.background = "#0ff";
    }

    const energyBar = document.getElementById('p1-energy');
    if (energyBar) {
        energyBar.style.width = Math.max(0, player.energy) + '%';
        energyBar.style.boxShadow = player.energy >= 100 ? '0 0 12px #fff' : '0 0 6px #ff0';
        energyBar.style.background = player.energy >= 100 ? '#fff' : '#ff0';
    }
}

export function togglePause() {
    if (state.currentState !== GAME_STATE.PLAYING) return;
    state.isPaused = !state.isPaused;
    document.getElementById('pause-screen').style.display = state.isPaused ? 'flex' : 'none';
    document.getElementById('hud').style.display = state.isPaused ? 'none' : 'block';
}
window.togglePause = togglePause;

export function updateControlsHint(mode) {
    const hint = document.getElementById('controls-hint');
    if (!hint) return;
    hint.innerText = mode === 'pvp'
        ? 'P1 W/S+F | P2 ↑/↓+L | SPACE: OVERDRIVE | ESC: PAUSA'
        : 'W/S: MOVER | SPACE: OVERDRIVE | CLICK: SWING | ESC: PAUSA';
}

export function startPVP() {
    state.gameMode = 'pvp';
    enemy.name = "JOGADOR 2";
    enemy.color = "#f0f";
    enemy.hp = 100;
    enemy.maxHp = 100;
    enemy.ability = null;
    enemy.isFinalBoss = false;
    enemy.alpha = 1.0;
    enemy.burstTimer = 0;
    player.hp = 100;
    player.maxHp = 100;
    player.energy = 0;
    updateControlsHint('pvp');
    enterArena();
}
window.startPVP = startPVP;

export function startCampaign() {
    state.gameMode = 'campaign';
    state.currentLevelIndex = 0;
    state.currentState = GAME_STATE.PROLOGUE;
    updateControlsHint('normal');
    startDialogueSequence(PROLOGUE_DIALOGUE, "O DESPERTAR");
}
window.startCampaign = startCampaign;

export function showBattleSelect() {
    state.currentState = GAME_STATE.BATTLE_SELECT;
    setScreen('battle-select-screen');

    const grid = document.getElementById('battle-grid');
    grid.innerHTML = '';

    CAMPAIGN_LEVELS.forEach((boss, index) => {
        const div = document.createElement('div');
        div.className = 'boss-card';
        div.style.color = boss.color;
        div.style.borderColor = boss.color;
        const stars = '★'.repeat(5 - Math.floor(boss.aiError / 7)) + '☆'.repeat(Math.floor(boss.aiError / 7));
        div.innerHTML = `<span>${boss.icon}</span><h3>${boss.name}</h3><div class="boss-difficulty" data-difficulty="${boss.aiError}">${stars}</div>`;
        div.onclick = () => startQuickBattle(index);
        grid.appendChild(div);
    });
}
window.showBattleSelect = showBattleSelect;

export function startQuickBattle(index) {
    state.gameMode = 'battle';
    state.currentLevelIndex = index;
    updateControlsHint('normal');
    setupLevel(index, true);
}
window.startQuickBattle = startQuickBattle;

export function nextLevel() {
    if (state.gameMode === 'pvp') { startPVP(); return; }
    if (state.gameMode === 'battle') { showBattleSelect(); return; }
    state.currentLevelIndex++;
    if (state.currentLevelIndex >= CAMPAIGN_LEVELS.length) {
        localStorage.removeItem('cyberpong_level');
        showEndingScreen();
    } else {
        setupLevel(state.currentLevelIndex);
    }
}
window.nextLevel = nextLevel;

export function restartLevel() {
    if (state.gameMode === 'pvp') { startPVP(); return; }
    if (state.gameMode === 'battle') startQuickBattle(state.currentLevelIndex);
    else setupLevel(state.currentLevelIndex);
}
window.restartLevel = restartLevel;
