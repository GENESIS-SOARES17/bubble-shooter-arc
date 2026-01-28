// uiManager.js - Gerenciamento da interface do usuário

export class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = {};
        this.fps = 0;
        this.fpsInterval = 0;
        this.lastFrameTime = 0;
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateFPS();
    }

    cacheElements() {
        this.elements = {
            wallet: document.getElementById("wallet"),
            balance: document.getElementById("balance"),
            score: document.getElementById("score"),
            level: document.getElementById("level"),
            combo: document.getElementById("combo"),
            comboValue: document.getElementById("comboValue"),
            comboDisplay: document.getElementById("comboDisplay"),
            overlay: document.getElementById("overlay"),
            pauseOverlay: document.getElementById("pauseOverlay"),
            btnConnect: document.getElementById("btnConnect"),
            btnSign: document.getElementById("btnSign"),
            btnStart: document.getElementById("btnStart"),
            btnPause: document.getElementById("btnPause"),
            btnRestart: document.getElementById("btnRestart"),
            fps: document.getElementById("fps"),
            fpsCounter: document.getElementById("fpsCounter")
        };
    }

    setupEventListeners() {
        this.elements.btnConnect.onclick = () => this.app.modules.web3.connectWallet();
        this.elements.btnSign.onclick = () => this.app.modules.web3.signTerms();
        this.elements.btnStart.onclick = () => this.app.startGame();
        this.elements.btnPause.onclick = () => this.app.pauseGame();
        this.elements.btnRestart.onclick = () => this.app.restartGame();
    }

    updateUI() {
        const state = this.app.getState();
        
        if (this.elements.wallet) {
            this.elements.wallet.textContent = state.account ? 
                `${state.account.slice(0, 6)}...${state.account.slice(-4)}` : "---";
        }
        
        if (this.elements.balance) {
            this.elements.balance.textContent = state.balance.toFixed(4);
        }
        
        if (this.elements.score) {
            this.elements.score.textContent = state.score.toLocaleString();
        }
        
        if (this.elements.level) {
            this.elements.level.textContent = state.level;
        }
        
        if (this.elements.combo) {
            this.elements.combo.textContent = `x${state.combo}`;
        }
        
        if (this.elements.comboValue) {
            this.elements.comboValue.textContent = `x${state.combo}`;
        }
        
        if (this.elements.comboDisplay) {
            if (state.combo > 1) {
                this.elements.comboDisplay.textContent = `COMBO x${state.combo}!`;
                this.elements.comboDisplay.classList.add('active');
                const redValue = Math.min(255, state.combo * 30);
                this.elements.comboDisplay.style.background = 
                    `linear-gradient(45deg, rgba(255, 0, 128, 0.8), rgba(255, ${redValue}, 0, 0.8))`;
            } else {
                this.elements.comboDisplay.classList.remove('active');
            }
        }
    }

    updateWalletUI(account, connected) {
        if (connected) {
            this.elements.btnSign.disabled = false;
            this.elements.btnConnect.textContent = "✅ Conectado";
            this.elements.btnConnect.disabled = true;
            document.getElementById("statusMsg").textContent = "🔐 ASSINE OS TERMOS";
        } else {
            this.elements.btnSign.disabled = true;
            this.elements.btnStart.disabled = true;
            this.elements.btnSign.textContent = "2. Assinar Termos";
            this.elements.btnConnect.textContent = "1. Conectar MetaMask";
            this.elements.btnConnect.disabled = false;
        }
    }

    updateSignUI(signed) {
        if (signed) {
            this.elements.btnStart.disabled = false;
            this.elements.btnSign.textContent = "✅ Assinado";
            this.elements.btnSign.disabled = true;
            document.getElementById("statusMsg").textContent = "🔓 PRONTO PARA JOGAR";
        }
    }

    showGameControls() {
        this.elements.btnStart.style.display = "none";
        this.elements.btnPause.style.display = "block";
        this.elements.btnRestart.style.display = "block";
    }

    hideOverlay() {
        this.elements.overlay.style.display = "none";
    }

    togglePauseOverlay(show) {
        this.elements.pauseOverlay.style.display = show ? "flex" : "none";
        this.elements.btnPause.textContent = show ? "▶️ Continuar" : "⏸️ Pausar";
    }

    updateFPS() {
        const now = performance.now();
        if (this.lastFrameTime > 0) {
            const delta = now - this.lastFrameTime;
            this.fps = Math.round(1000 / delta);
        }
        this.lastFrameTime = now;
        
        if (this.fpsInterval) clearInterval(this.fpsInterval);
        this.fpsInterval = setInterval(() => {
            if (this.elements.fps) this.elements.fps.textContent = `FPS: ${this.fps}`;
            if (this.elements.fpsCounter) this.elements.fpsCounter.textContent = `FPS: ${this.fps}`;
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}