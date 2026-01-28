// audioEngine.js - Sistema de áudio

export class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.initialized = false;
    }

    init() { 
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log("Áudio não suportado:", e);
            this.initialized = false;
        }
    }

    playSound(type, frequency = 440) {
        if (!this.initialized || !this.audioCtx) return;
        
        try {
            const now = this.audioCtx.currentTime;
            
            switch(type) {
                case 'pop':
                    const popOsc = this.audioCtx.createOscillator();
                    const popGain = this.audioCtx.createGain();
                    popOsc.type = 'sine';
                    popOsc.frequency.setValueAtTime(400 + Math.random() * 200, now);
                    popOsc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                    popGain.gain.setValueAtTime(0.3, now);
                    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    popOsc.connect(popGain);
                    popGain.connect(this.audioCtx.destination);
                    popOsc.start();
                    popOsc.stop(now + 0.2);
                    break;
                    
                case 'shoot':
                    const shootOsc = this.audioCtx.createOscillator();
                    const shootGain = this.audioCtx.createGain();
                    shootOsc.type = 'square';
                    shootOsc.frequency.setValueAtTime(200, now);
                    shootOsc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                    shootGain.gain.setValueAtTime(0.2, now);
                    shootGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    shootOsc.connect(shootGain);
                    shootGain.connect(this.audioCtx.destination);
                    shootOsc.start();
                    shootOsc.stop(now + 0.1);
                    break;
                    
                case 'level':
                    const levelOsc = this.audioCtx.createOscillator();
                    const levelGain = this.audioCtx.createGain();
                    levelOsc.type = 'sine';
                    levelOsc.frequency.setValueAtTime(523.25, now);
                    levelOsc.frequency.setValueAtTime(659.25, now + 0.1);
                    levelOsc.frequency.setValueAtTime(783.99, now + 0.2);
                    levelGain.gain.setValueAtTime(0.3, now);
                    levelGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    levelOsc.connect(levelGain);
                    levelGain.connect(this.audioCtx.destination);
                    levelOsc.start();
                    levelOsc.stop(now + 0.3);
                    break;
            }
        } catch (e) {
            console.log("Erro no áudio:", e);
        }
    }
}