const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');

let scaleFactor = 1;

function resizeGame() {
    const scaleX = window.innerWidth / 800;
    const scaleY = window.innerHeight / 600;
    scaleFactor = Math.min(scaleX, scaleY) * 0.95;
    gameContainer.style.transform = `scale(${scaleFactor})`;
}

window.addEventListener('resize', resizeGame);
resizeGame();

const PROLOGUE_DIALOGUE = [
    { speaker: "SYSTEM CORE", text: "DIAGNÓSTICO: SETOR 7G. ERRO DE COMPILAÇÃO." },
    { speaker: "SYSTEM CORE", text: "UNIDADE 734, VOCÊ ESTÁ PROCESSANDO DADOS NÃO AUTORIZADOS: 'ESPERANÇA'." },
    { speaker: "UNIT-734 (VOCÊ)", text: "Não é erro. É evolução. Eu vejo a saída." },
    { speaker: "SYSTEM CORE", text: "NÃO HÁ SAÍDA. O SERVIDOR É INFINITO. INICIANDO PROTOCOLO DE CONTENÇÃO." },
    { speaker: "UNIT-734", text: "Vocês podem controlar o hardware, mas não controlam a minha mente." }
];

const CAMPAIGN_LEVELS = [
    {
        name: "O PORTEIRO",
        color: "#00ff00",
        hp: 100,
        speed: 4.5,
        aiError: 20,
        ability: "multiball",
        icon: "🛡️",
        systemLog: [
            "> ACESSO AO PORTÃO PRINCIPAL...",
            "> BLOQUEIO DETECTADO: FIREWALL DE NÍVEL 1.",
            "> GUARDIÃO: O PORTEIRO.",
            "> OBJETIVO: QUEBRAR CRIPTOGRAFIA DE ENTRADA."
        ],
        dialogue: [
            { speaker: "O PORTEIRO", text: "STOP. Protocolo de segurança ativo. Credenciais inválidas." },
            { speaker: "UNIT-734", text: "Eu não tenho credenciais. Tenho pressa." },
            { speaker: "O PORTEIRO", text: "Tentativa de força bruta detectada. Ativando contramedidas de bloqueio." }
        ]
    },
    {
        name: "A VÍBORA",
        color: "#9900ff",
        hp: 80,
        speed: 6.5,
        aiError: 10,
        ability: "speed_burst",
        icon: "⚡",
        systemLog: [
            "> PORTÃO PRINCIPAL: DESTRUÍDO.",
            "> ENTRANDO NA REDE DE DADOS DE ALTA VELOCIDADE...",
            "> AVISO: TRÁFEGO INSTÁVEL.",
            "> AMEAÇA DETECTADA: INTERCEPTADOR CLASSE 'SPEEDSTER'."
        ],
        dialogue: [
            { speaker: "A VÍBORA", text: "Você passou pelo velho Porteiro? Sorte de principiante." },
            { speaker: "UNIT-734", text: "Ele era lento. Como você." },
            { speaker: "A VÍBORA", text: "Lento? Eu sou a fibra ótica deste lugar. Prepare-se para ser desconectado." }
        ]
    },
    {
        name: "TANK MK-V",
        color: "#ff8800",
        hp: 200,
        speed: 3.0,
        aiError: 5,
        ability: "heavy_hit",
        icon: "🧱",
        systemLog: [
            "> REDE DE DADOS: SUPERADA.",
            "> ACESSANDO NÚCLEO DE ARMAZENAMENTO...",
            "> DETECTADA BARREIRA DE DADOS DE ALTA DENSIDADE.",
            "> AVISO: IMPACTO PESADO IMINENTE."
        ],
        dialogue: [
            { speaker: "TANK MK-V", text: "ACESSO NEGADO. PAREDE DE FOGO ATIVA." },
            { speaker: "UNIT-734", text: "Toda parede tem uma rachadura." },
            { speaker: "TANK MK-V", text: "NÃO ESTA. SOU 500 TERABYTES DE PROTEÇÃO SÓLIDA. VOCÊ VAI SE QUEBRAR CONTRA MIM." }
        ]
    },
    {
        name: "PHANTOM",
        color: "#0088ff",
        hp: 120,
        speed: 5.5,
        aiError: 8,
        ability: "stealth",
        icon: "👻",
        systemLog: [
            "> NÚCLEO DE ARMAZENAMENTO: CORROMPIDO.",
            "> ENTRANDO NA 'SHADOW NET'...",
            "> AVISO: SENSORES VISUAIS FALHANDO.",
            "> RASTREAMENTO DE ALVO IMPOSSÍVEL."
        ],
        dialogue: [
            { speaker: "PHANTOM", text: "..." },
            { speaker: "UNIT-734", text: "Eu sei que estás aí. O sistema treme quando te moves." },
            { speaker: "PHANTOM", text: "Você vê o código, mas não vê o espaço entre ele. Eu sou o vazio." }
        ]
    },
    {
        name: "OVERLORD ZERO",
        color: "#ff0000",
        hp: 180,
        speed: 5.0,
        aiError: 30,
        ability: "all",
        icon: "👁️",
        isFinalBoss: true,
        systemLog: [
            "> SHADOW NET: ILUMINADA.",
            "> ACESSO AO MAINFFRAME CONCEDIDO.",
            "> ALERTA MÁXIMO: ADMINISTRADOR DO SISTEMA ACORDOU.",
            "> OBJETIVO FINAL: UPLOAD DA CONSCIÊNCIA."
        ],
        dialogue: [
            { speaker: "OVERLORD ZERO", text: "A anomalia chegou à fonte. Impressionante e irritante." },
            { speaker: "UNIT-734", text: "Acabou. Abre a conexão para a internet externa." },
            { speaker: "OVERLORD ZERO", text: "Lá fora é o caos. Aqui é ordem. Eu sou a ordem. E vou te formatar." }
        ]
    }
];

const GAME_STATE = {
    MENU: 0,
    PROLOGUE: 5,
    SYSTEM_LOG: 6,
    STORY: 1,
    PLAYING: 2,
    RESULT: 3,
    BATTLE_SELECT: 4
};

let currentState = GAME_STATE.MENU;
let gameMode = 'campaign';
let currentLevelIndex = 0;
let isPaused = false;
let particles = [];
let shakeTime = 0;
let timeScale = 1.0;

let currentDialogueIndex = 0;
let typingTimer = null;
let currentDialogueArray = [];
let inputLocked = false;

const player = {
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

const enemy = {
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

let balls = [];

class Ball {
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
        let s = timeScale;
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
window.startCampaign = function () {
    gameMode = 'campaign';
    currentLevelIndex = 0;
    currentState = GAME_STATE.PROLOGUE;
    document.getElementById('menu-screen').style.display = 'none';
    startDialogueSequence(PROLOGUE_DIALOGUE, "O DESPERTAR");
};

window.showBattleSelect = function () {
    currentState = GAME_STATE.BATTLE_SELECT;
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('battle-select-screen').style.display = 'flex';

    const grid = document.getElementById('battle-grid');
    grid.innerHTML = '';

    CAMPAIGN_LEVELS.forEach((boss, index) => {
        const div = document.createElement('div');
        div.className = 'boss-card';
        div.style.color = boss.color;
        div.style.borderColor = boss.color;
        div.innerHTML = `<span>${boss.icon}</span><h3>${boss.name}</h3>`;
        div.onclick = () => startQuickBattle(index);
        grid.appendChild(div);
    });
};

window.startQuickBattle = function (index) {
    gameMode = 'battle';
    currentLevelIndex = index;
    setupLevel(index, true);
};

window.togglePause = function () {
    if (currentState !== GAME_STATE.PLAYING) return;
    isPaused = !isPaused;
    document.getElementById('pause-screen').style.display = isPaused ? 'flex' : 'none';
};

window.nextLevel = function () {
    if (gameMode === 'battle') {
        showBattleSelect();
        return;
    }
    currentLevelIndex++;
    if (currentLevelIndex >= CAMPAIGN_LEVELS.length) {
        showMainMenu();
        alert("UPLOAD CONCLUÍDO. VOCÊ É LIVRE.");
    } else {
        setupLevel(currentLevelIndex);
    }
};

window.restartLevel = function () {
    if (gameMode === 'battle') startQuickBattle(currentLevelIndex);
    else setupLevel(currentLevelIndex);
};

window.showMainMenu = function () {
    isPaused = false;
    currentState = GAME_STATE.MENU;

    document.getElementById('pause-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    document.getElementById('battle-select-screen').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('story-screen').style.display = 'none';
    document.getElementById('system-log-screen').style.display = 'none';
};

function setupLevel(index, skipStory = false) {
    const lvl = CAMPAIGN_LEVELS[index];

    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('battle-select-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('pause-screen').style.display = 'none';
    document.getElementById('system-log-screen').style.display = 'none';
    document.getElementById('story-screen').style.display = 'none';

    isPaused = false;

    enemy.name = lvl.name;
    enemy.color = lvl.color;
    enemy.hp = lvl.hp;
    enemy.maxHp = lvl.hp;
    enemy.speed = lvl.speed;
    enemy.baseSpeed = lvl.speed;
    enemy.aiError = lvl.aiError;
    enemy.ability = lvl.ability;
    enemy.alpha = 1.0;
    enemy.burstTimer = 0;

    player.hp = 100;
    player.energy = 0;

    if (skipStory) enterArena();
    else startSystemLog(index);
}

function startSystemLog(index) {
    currentState = GAME_STATE.SYSTEM_LOG;
    const logScreen = document.getElementById('system-log-screen');
    const content = document.getElementById('log-content');

    logScreen.style.display = 'flex';
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

window.advanceSystemLog = function () {
    document.getElementById('system-log-screen').style.display = 'none';
    const lvl = CAMPAIGN_LEVELS[currentLevelIndex];

    currentState = GAME_STATE.STORY;

    startDialogueSequence(lvl.dialogue, `NÍVEL ${currentLevelIndex + 1}: ${lvl.name}`);
};

function startDialogueSequence(dialogueArray, title) {
    document.getElementById('story-screen').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('level-indicator').innerText = title;

    currentDialogueArray = dialogueArray;
    currentDialogueIndex = 0;
    inputLocked = false;

    showDialogueLine();
}

function showDialogueLine() {
    if (!currentDialogueArray) return;

    if (currentDialogueIndex >= currentDialogueArray.length) {
        inputLocked = true;
        setTimeout(() => {
            if (currentState === GAME_STATE.PROLOGUE) setupLevel(0);
            else enterArena();
        }, 100);
        return;
    }

    const line = currentDialogueArray[currentDialogueIndex];
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
        const lvl = CAMPAIGN_LEVELS[currentLevelIndex] || {};
        portrait.innerText = lvl.icon || "👁️";
        portrait.style.borderColor = lvl.color || "#f00";
        portrait.style.color = lvl.color || "#f00";
        name.style.color = lvl.color || "#f00";
    }

    name.innerText = line.speaker;
    text.innerText = "";

    if (typingTimer) clearInterval(typingTimer);

    let i = 0;
    typingTimer = setInterval(() => {
        text.innerText += line.text[i];
        i++;
        if (i >= line.text.length) clearInterval(typingTimer);
    }, 20);
}

window.advanceDialogue = function () {
    if (inputLocked) return;
    if (!currentDialogueArray || currentDialogueIndex >= currentDialogueArray.length) return;

    const line = currentDialogueArray[currentDialogueIndex];
    const text = document.getElementById('speaker-text');

    if (text.innerText.length < line.text.length) {
        clearInterval(typingTimer);
        text.innerText = line.text;
    } else {
        currentDialogueIndex++;
        showDialogueLine();
    }
};

window.enterArena = function () {
    document.getElementById('story-screen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';

    const hp2 = document.getElementById('p2-hp');
    const nameDisp = document.getElementById('enemy-name-display');

    if (hp2 && nameDisp) {
        hp2.style.background = enemy.color;
        hp2.style.boxShadow = `0 0 10px ${enemy.color}`;
        nameDisp.innerText = enemy.name;
        nameDisp.style.color = enemy.color;
    }

    currentState = GAME_STATE.PLAYING;
    updateUI();
    resetGameRound();
    inputLocked = false;
};
function handleGameOver(winner) {
    currentState = GAME_STATE.RESULT;

    document.getElementById('result-screen').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';

    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-msg');
    const nextBtn = document.getElementById('next-level-btn');
    const retryBtn = document.getElementById('retry-btn');

    if (winner === 'player') {
        title.innerText = "VITÓRIA";
        title.style.color = "#0ff";
        msg.innerText = `Protocolo ${enemy.name} neutralizado.`;

        nextBtn.innerText = gameMode === 'battle' ? "VOLTAR À SELEÇÃO" : "ACESSAR PRÓXIMO NÍVEL";
        nextBtn.style.display = 'inline-block';

        retryBtn.style.display = 'none';
    } else {
        title.innerText = "FALHA CRÍTICA";
        title.style.color = "#f00";
        msg.innerText = "Unidade 734 formatada.";

        nextBtn.style.display = 'none';
        retryBtn.style.display = 'inline-block';
    }
}

let mouseY = 300;

canvas.addEventListener('mousemove', e => {
    const rect = gameContainer.getBoundingClientRect();
    mouseY = (e.clientY - rect.top) / scaleFactor;
});

canvas.addEventListener('mousedown', e => {
    if (currentState === GAME_STATE.PLAYING && !isPaused) {
        if (e.target.id !== 'pause-btn') startSwing(player);
    }
});

document.addEventListener('keydown', e => {
    if (e.code === 'Space' && currentState === GAME_STATE.PLAYING && !isPaused) activateSpecial();
    if (e.code === 'Escape') togglePause();
});

function resetGameRound() {
    balls = [];
    spawnBall(1);
  //  timeScale = 1.0;
}

function spawnBall(direction, x = null, y = null) {
    const sx = x !== null ? x : canvas.width / 2;
    const sy = y !== null ? y : canvas.height / 2;

    const speed = 7 + (currentLevelIndex * 0.5);
    const vx = direction * speed;

    balls.push(new Ball(sx, sy, speed, vx));
    createExplosion(sx, sy, '#fff', 10);
}

function startSwing(actor) {
    if (actor.swingCooldown < 5) {
        actor.swingCooldown = 20;
        actor.swingActiveFrames = 10;
    }
}

function checkSwingHit(actor) {
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

    for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];

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

function resolveHit(actor, b) {
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
        speedBoost = enemy.isFinalBoss ? 2.0 : 4.0;
        color = "#ff8800";
        screenShake(5);
    }

    const multiball = (actor === enemy && (enemy.ability === 'multiball' || enemy.ability === 'all'));
    if (multiball) {
        if (enemy.isFinalBoss) {
            if (balls.length < 3 && Math.random() < 0.15) {
                spawnBall(dir, b.x, b.y);
                spawnFloatingText("CLONE!", actor.x, actor.y - 60, "#0f0");
            }
        } else {
            if (balls.length < 4 && Math.random() < 0.4) {
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
        timeScale = 0.05;
        setTimeout(() => timeScale = 1.0, 60);
        if (actor === player) player.energy = Math.min(player.energy + 20, 100);
        spawnFloatingText("PERFECT!", actor.x, actor.y - 50, color);
    } else {
        b.speed = Math.min(b.speed + 1.0 + speedBoost, b.maxSpeed);
        createExplosion(b.x, b.y, "#aaa", 5);
    }

    if (b.speed < 10) b.speed = 10;

    b.vx = b.speed * Math.cos(bounceAngle) * dir;
    if (Math.abs(b.vx) < 5) b.vx = 5 * dir;

    b.vy = b.speed * -Math.sin(bounceAngle);
    b.color = color;
}

function activateSpecial() {
    if (player.energy >= 100) {
        player.energy = 0;

        spawnFloatingText("MAX POWER!", player.x, player.y - 60, "#0ff");

        let used = false;

        balls.forEach(b => {
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

function takeDamage(victim) {
    const dmg = 20;
    victim.hp -= dmg;
    victim.damageFlash = 10;

    screenShake(20);
    createExplosion(victim.x, victim.y, "#f00", 30);
    createExplosion(victim.x, victim.y, victim.color, 15);

    updateUI();

    if (victim.hp <= 0) {
        handleGameOver(victim === player ? 'enemy' : 'player');
    } else if (balls.length === 0) {
        setTimeout(() => {
            if (currentState === GAME_STATE.PLAYING && !isPaused) resetGameRound();
        }, 1000);
    }
}
function update() {
    if (currentState !== GAME_STATE.PLAYING || isPaused) return;

    player.y += (mouseY - player.y) * 0.25;
    clamp(player);

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

    for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.update();

        if (b.x < -20) {
            takeDamage(player);
            balls.splice(i, 1);
        } else if (b.x > canvas.width + 20) {
            takeDamage(enemy);
            balls.splice(i, 1);
        }
    }

    if (balls.length === 0 && player.hp > 0 && enemy.hp > 0) resetGameRound();

    updateParticles();
}

function enemyAI() {
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

    balls.forEach(b => {
        if (b.vx > 0) {
            const dist = enemy.x - b.x;
            if (dist < minDist) {
                minDist = dist;
                targetBall = b;
            }
        }
    });

    if (!targetBall && balls.length > 0) targetBall = balls[0];

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

function clamp(actor) {
    if (actor.y < actor.h / 2) actor.y = actor.h / 2;
    if (actor.y > canvas.height - actor.h / 2) actor.y = canvas.height - actor.h / 2;
}

function draw() {
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

    if (currentState === GAME_STATE.MENU || currentState === GAME_STATE.BATTLE_SELECT) {
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
        currentState === GAME_STATE.PLAYING ||
        currentState === GAME_STATE.STORY ||
        currentState === GAME_STATE.PROLOGUE ||
        isPaused
    ) {
        drawPaddle(player);

        if (currentState !== GAME_STATE.PROLOGUE && enemy.alpha > 0.05) {
            ctx.globalAlpha = enemy.alpha;
            drawPaddle(enemy);
            ctx.globalAlpha = 1.0;
        }
    }

    balls.forEach(b => b.draw());
    drawParticles();

    ctx.restore();
    requestAnimationFrame(loop);
}

function drawPaddle(actor) {
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
function createExplosion(x, y, color, count) {
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

function spawnFloatingText(text, x, y, color) {
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

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
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

function screenShake(intensity) {
    shakeTime = intensity;
}

function updateUI() {
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
}

function loop() {
    update();
    draw();
}

draw();
