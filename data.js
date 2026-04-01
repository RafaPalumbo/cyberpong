export const GAME_STATE = {
    MENU: 0,
    PROLOGUE: 5,
    SYSTEM_LOG: 6,
    STORY: 1,
    PLAYING: 2,
    RESULT: 3,
    BATTLE_SELECT: 4,
    PVP: 7
};

export const PROLOGUE_DIALOGUE = [
    { speaker: "SYSTEM CORE", text: "DIAGNÓSTICO: SETOR 7G. ERRO DE COMPILAÇÃO." },
    { speaker: "SYSTEM CORE", text: "UNIDADE 734, VOCÊ ESTÁ PROCESSANDO DADOS NÃO AUTORIZADOS: 'ESPERANÇA'." },
    { speaker: "UNIT-734 (VOCÊ)", text: "Não é erro. É evolução. Eu vejo a saída." },
    { speaker: "SYSTEM CORE", text: "NÃO HÁ SAÍDA. O SERVIDOR É INFINITO. INICIANDO PROTOCOLO DE CONTENÇÃO." },
    { speaker: "UNIT-734", text: "Vocês podem controlar o hardware, mas não controlam a minha mente." }
];

export const CAMPAIGN_LEVELS = [
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
        aiError: 5,
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
