// app.js - Módulo principal que inicializa a aplicação

import { Game } from './gameEngine.js';
import { UIManager } from './uiManager.js';
import { Web3Integration } from './web3Integration.js';
import { Calculator } from './calculator.js';
import { Customization } from './customization.js';
import { ParticleSystem } from './particleSystem.js';
import { CryptoTicker } from './cryptoTicker.js';
import { AudioEngine } from './audioEngine.js';

class ARCApp {
    constructor() {
        this.state = {
            score: 0,
            balance: 0,
            level: 1,
            combo: 1,
            maxCombo: 1,
            gameInitialized: false,
            gameRunning: false,
            gamePaused: false,
            startDebounce: false,
            account: null,
            signed: false
        };

        this.modules = {};
    }

    async init() {
        console.log("ARC Bubble Shooter v3.0 - Inicializando...");

        // Inicializar módulos
        this.modules.ui = new UIManager(this);
        this.modules.web3 = new Web3Integration(this);
        this.modules.game = new Game(this);
        this.modules.calculator = new Calculator();
        this.modules.customization = new Customization(this);
        this.modules.particles = new ParticleSystem();
        this.modules.ticker = new CryptoTicker();
        this.modules.audio = new AudioEngine();

        // Configurar comunicação entre módulos
        this.setupModuleCommunication();

        // Inicializar UI
        this.modules.ui.init();

        // Carregar preferências salvas
        this.modules.customization.loadPreferences();

        // Inicializar ticker
        this.modules.ticker.init();

        // Configurar listeners globais
        this.setupGlobalListeners();

        console.log("Aplicação inicializada!");
    }

    setupModuleCommunication() {
        // Exemplo: Quando o jogo atualizar o score, notificar UI
        this.modules.game.onScoreUpdate = (score) => {
            this.state.score = score;
            this.modules.ui.updateUI();
        };
    }

    setupGlobalListeners() {
        window.addEventListener('error', (e) => {
            console.error('Erro global:', e.error);
            this.modules.ui.showNotification('Erro no jogo. Recarregue a página.', 'error');
        });

        // Redimensionamento
        window.addEventListener('resize', () => {
            if (this.modules.game) {
                this.modules.game.resize();
            }
        });
    }

    // Métodos para controle do jogo
    startGame() {
        if (this.state.startDebounce) return;
        this.state.startDebounce = true;

        if (!this.state.gameInitialized) {
            this.modules.ui.hideOverlay();
            this.modules.audio.init();
            this.modules.game.init();
            this.state.gameInitialized = true;
            this.modules.ui.showNotification("Jogo iniciado! Segure o botão do mouse para carregar o tiro.", "info");
        }

        this.state.gameRunning = true;
        this.modules.ui.showGameControls();

        setTimeout(() => this.state.startDebounce = false, 500);
    }

    pauseGame() {
        this.state.gamePaused = !this.state.gamePaused;
        this.modules.ui.togglePauseOverlay(this.state.gamePaused);
        
        if (this.state.gamePaused) {
            this.modules.ui.showNotification("Jogo pausado", "info");
        }
    }

    restartGame() {
        if (confirm("Reiniciar o jogo? Seu progresso será perdido.")) {
            this.state.score = 0;
            this.state.level = 1;
            this.state.combo = 1;
            this.state.balance = 0;
            this.state.maxCombo = 1;
            this.modules.game.generateLevel();
            this.modules.ui.updateUI();
            this.modules.ui.showNotification("Jogo reiniciado!", "info");
        }
    }

    // Getters para estado
    getState() {
        return this.state;
    }

    updateState(newState) {
        Object.assign(this.state, newState);
        this.modules.ui.updateUI();
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.arcApp = new ARCApp();
    window.arcApp.init();
});