let audioCtx = null;

export function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(type, freqStart, duration, freqEnd = null) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
    if (freqEnd !== null) {
        osc.frequency.linearRampToValueAtTime(freqEnd, audioCtx.currentTime + duration / 1000);
    }

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration / 1000);
}

function playSequence(notes) {
    notes.forEach(n => {
        setTimeout(() => playTone(n.type, n.freq, n.duration), n.delay);
    });
}

export function playHit() {
    playTone('square', 220, 80);
}

export function playPerfect() {
    playTone('sine', 440, 150, 880);
}

export function playPoint() {
    playTone('sawtooth', 80, 200);
}

export function playOverdrive() {
    playTone('sine', 200, 300, 1200);
}

export function playGameOver() {
    playSequence([
        { type: 'square', freq: 440, duration: 150, delay: 0 },
        { type: 'square', freq: 220, duration: 150, delay: 160 },
        { type: 'square', freq: 110, duration: 200, delay: 320 }
    ]);
}

export function playVictory() {
    playSequence([
        { type: 'sine', freq: 220, duration: 150, delay: 0 },
        { type: 'sine', freq: 440, duration: 150, delay: 160 },
        { type: 'sine', freq: 880, duration: 250, delay: 320 }
    ]);
}
