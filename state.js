// Shared mutable state — imported as an object so any module can write to it.
// ES6 `export let` only allows the declaring module to reassign; using a single
// exported object bypasses that restriction without adding setter functions.
import { GAME_STATE } from './data.js';

export const state = {
    currentState: GAME_STATE.MENU,
    gameMode: 'campaign',
    currentLevelIndex: 0,
    isPaused: false,
    timeScale: 1.0,
    balls: [],
    mouseY: 300,
    currentDialogueIndex: 0,
    typingTimer: null,
    currentDialogueArray: [],
    inputLocked: false
};
