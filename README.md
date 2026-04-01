# ⚡ Cyber Pong — Escape Protocol

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success?style=for-the-badge">
  <img src="https://img.shields.io/badge/version-v13.0-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/javascript-ES6_modules-yellow?style=for-the-badge">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge">
</p>

<p align="center">
Uma releitura moderna do clássico <b>Pong</b>, ambientada em um universo <b>cyberpunk</b> com narrativa, campanha, modo 1v1 e mecânicas únicas.
</p>

---

# 🎮 Jogar Agora

Acesse diretamente no navegador:

### 👉 https://cyberpongame.netlify.app

Nenhuma instalação é necessária.

---

# 📌 Sobre o Projeto

**Cyber Pong: Escape Protocol** é uma reinterpretação criativa do clássico Pong, desenvolvida com identidade visual cyberpunk e foco em gameplay dinâmico.

No jogo, o jogador controla a **UNIT-734**, uma IA que tenta escapar de um sistema digital hostil enfrentando guardiões progressivamente mais difíceis em batalhas estilizadas de Pong.

O projeto combina:
- Simplicidade de um clássico arcade
- Estética futurista com scanlines, partículas e efeitos de glow
- Progressão de desafio com narrativa entre fases
- Mecânicas adicionais que ampliam a experiência original
- Arquitetura modular em ES6

---

# 🕹️ Modos de Jogo

## 🏃 Campanha
Modo história com prólogo narrativo e 5 níveis progressivos. Cada fase apresenta um guardião com habilidade única, diálogo e log de sistema temático. O progresso é salvo automaticamente via `localStorage`.

## ⚔️ Batalha Rápida
Escolha qualquer oponente e entre direto na partida. Ideal para treinar contra um boss específico.

## 👥 1 VS 1 Local
Dois jogadores no mesmo teclado. Controles independentes para cada lado — sem IA, disputa humana direta.

---

# 🎯 Mecânicas do Jogo

### ⚡ Overdrive
Acumule energia rebatendo a bola. Com a barra cheia, ative o Overdrive para disparar a bola em velocidade máxima em linha reta.

### 🎯 Swing
Ataque ativo que expande a área de rebatida e aplica efeito de ângulo na bola. Acertar no ponto certo gera um **PERFECT HIT** com bônus de velocidade e energia.

### 👾 Oponentes com Habilidades Únicas
| Oponente | Habilidade |
|---|---|
| O Porteiro | Multiball — clona a bola ao rebater |
| A Víbora | Speed Burst — dash instantâneo de posicionamento |
| Tank MK-V | Heavy Hit — rebatidas com força aumentada |
| Phantom | Stealth — fica invisível periodicamente |
| Overlord Zero | All — combina todas as habilidades anteriores |

### 🖱️ Pointer Lock
O mouse fica capturado dentro da área do jogo durante a partida. Ao pressionar ESC o jogo pausa e o cursor é liberado automaticamente.

### 💾 Progresso Salvo
O avanço na campanha é salvo automaticamente. O menu exibe a opção **CONTINUAR** com o número do nível atual ao reabrir o jogo.

---

# 🎮 Controles

## Campanha / Batalha Rápida
| Ação | Controle |
|---|---|
| Mover a raquete | Mouse ou W / S |
| Swing | Clique |
| Overdrive | SPACE |
| Pausar / Soltar mouse | ESC |

## Modo 1 VS 1 Local
| Ação | Jogador 1 | Jogador 2 |
|---|---|---|
| Mover | W / S | ↑ / ↓ |
| Swing | F | L |
| Overdrive | SPACE | — |
| Pausar | ESC | ESC |

---

# ✨ Funcionalidades

- 🌆 Estética cyberpunk com scanlines, glow e partículas
- 📖 Narrativa com prólogo, logs de sistema e diálogos por fase
- ⚡ Sistema de Overdrive com barra de energia visual
- 🎯 Mecânica de Swing com hitbox e PERFECT HIT
- 👾 5 oponentes com habilidades distintas e dificuldade progressiva
- 👥 Modo 1v1 local para dois jogadores
- 🖱️ Pointer Lock — mouse capturado na área do jogo
- 🔊 Efeitos sonoros sintetizados via Web Audio API
- 💾 Progresso de campanha salvo via localStorage
- ⏸️ Sistema de pausa com liberação automática do mouse

---

# 🏗️ Arquitetura

O projeto foi refatorado da v9 (monolítico) para a v13 com arquitetura modular ES6:
```
cyberpong/
├── index.html
├── style.css
├── game.js        # loop principal, input, pointer lock
├── state.js       # estado global compartilhado
├── data.js        # CAMPAIGN_LEVELS, GAME_STATE, diálogos
├── entities.js    # player, enemy, classe Ball
├── physics.js     # colisão, swing, dano, special
├── ai.js          # lógica de IA dos oponentes
├── renderer.js    # draw, drawPaddle, screenShake
├── particles.js   # explosões e textos flutuantes
├── audio.js       # sons sintetizados via Web Audio API
└── ui.js          # telas, HUD, diálogos, localStorage
```

---

# 🛠️ Tecnologias

- HTML5 Canvas
- CSS3
- JavaScript ES6 (módulos nativos)
- Web Audio API

Sem frameworks ou bibliotecas externas.

---

# 🚀 Como Executar Localmente

Clone o repositório:
```bash
git clone https://github.com/RafaPalumbo/cyberpong.git
cd cyberpong
```

Por usar ES6 modules, o projeto precisa ser servido via servidor local. A forma mais simples:
```bash
# Com Python
python3 -m http.server 8000

# Com Node
npx serve .
```

Acesse `http://localhost:8000` no navegador.

> ⚠️ Abrir o `index.html` diretamente pelo sistema de arquivos não funciona com ES6 modules.

---

# 👨‍💻 Autor

**Rafael Palumbo**

[![GitHub](https://img.shields.io/badge/GitHub-RafaPalumbo-black?style=for-the-badge&logo=github)](https://github.com/RafaPalumbo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-rafaelpalumbo-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/rafaelpalumbo/)

---

# 📦 Versão

**v13.0 — Lock Edition**

---

⭐ Se você gostou do projeto, considere dar uma estrela no repositório.
