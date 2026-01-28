// gameEngine.js - Módulo do jogo

export class Game {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        
        this.bubbles = [];
        this.bullet = { 
            x: 0, 
            y: 0, 
            r: 21,
            dx: 0, 
            dy: 0, 
            active: false, 
            color: '#fff' 
        };
        
        this.isCharging = false;
        this.power = 0;
        this.maxPower = 20;
        this.maxSpeed = 25;
        this.friction = 0.992;
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener("mousedown", () => { 
            const state = this.app.getState();
            if(state.signed && state.gameRunning && !state.gamePaused) {
                this.isCharging = true;
                this.app.modules.audio.playSound('shoot');
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if (!this.isCharging) return;
            this.isCharging = false;
            
            const angle = Math.atan2(this.mouseY - this.bullet.y, this.mouseX - this.bullet.x);
            const speed = 5 + this.power;
            this.bullet.dx = Math.cos(angle) * speed;
            this.bullet.dy = Math.sin(angle) * speed;
            this.bullet.active = true;
            this.power = 0;
            
            // Atualizar barra de poder na UI
            document.getElementById("powerBar").style.width = "0%";
        });
    }

    init() {
        this.resize();
        this.generateLevel();
        this.resetBullet();
        this.loop();
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;
        
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.canvas.style.width = `${this.canvas.width}px`;
        this.canvas.style.height = `${this.canvas.height}px`;
    }

    generateLevel() {
        const state = this.app.getState();
        const colors = ["#00ffaa", "#00aaff", "#ffaa00", "#ff4444", "#aa00ff"];
        this.bubbles = [];
        const rows = 5 + state.level;
        const cols = Math.max(5, Math.floor(this.canvas.width / 70));
        const offset = this.canvas.width > 800 ? 60 : 40;
        
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                const x = offset + c * 60 + (r % 2 ? 30 : 0);
                const y = 60 + r * 50;
                
                this.bubbles.push({
                    x: x,
                    y: y,
                    r: 27,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    active: true
                });
            }
        }
    }

    resetBullet() {
        this.bullet.active = false;
        this.bullet.x = this.canvas.width / 2;
        this.bullet.y = this.canvas.height - 70;
        this.bullet.dx = 0;
        this.bullet.dy = 0;
    }

    update() {
        const state = this.app.getState();
        if (!state.gameRunning || state.gamePaused) return;
        
        // Atualizar FPS
        this.app.modules.ui.updateFPS();
        
        if (this.isCharging) {
            this.power = Math.min(this.maxPower, this.power + 0.25);
            document.getElementById("powerBar").style.width = `${(this.power / this.maxPower) * 100}%`;
        }
        
        if (this.bullet.active) {
            this.bullet.dx *= this.friction;
            this.bullet.dy *= this.friction;
            
            const speed = Math.hypot(this.bullet.dx, this.bullet.dy);
            if (speed > this.maxSpeed) {
                this.bullet.dx = (this.bullet.dx / speed) * this.maxSpeed;
                this.bullet.dy = (this.bullet.dy / speed) * this.maxSpeed;
            }
            
            this.bullet.x += this.bullet.dx;
            this.bullet.y += this.bullet.dy;
            
            // Colisão com bordas
            if (this.bullet.x - this.bullet.r < 0) {
                this.bullet.x = this.bullet.r;
                this.bullet.dx *= -0.95;
            } else if (this.bullet.x + this.bullet.r > this.canvas.width) {
                this.bullet.x = this.canvas.width - this.bullet.r;
                this.bullet.dx *= -0.95;
            }
            
            if (this.bullet.y - this.bullet.r < 0) {
                this.bullet.y = this.bullet.r;
                this.bullet.dy *= -0.95;
            }
            
            if (this.bullet.y > this.canvas.height) {
                this.app.updateState({ combo: 1 });
                this.resetBullet();
                this.app.modules.ui.showNotification("Combo perdido!", "error");
            }
            
            // Verificar colisão com bolhas
            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const b = this.bubbles[i];
                if (!b.active) continue;
                
                const dx = this.bullet.x - b.x;
                const dy = this.bullet.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.bullet.r + b.r) {
                    b.active = false;
                    this.bullet.active = false;
                    
                    this.app.modules.audio.playSound('pop');
                    this.app.modules.particles.createParticles(b.x, b.y, b.color, 15);
                    
                    const currentState = this.app.getState();
                    const newCombo = currentState.combo + 1;
                    const newMaxCombo = Math.max(currentState.maxCombo, newCombo);
                    const newScore = currentState.score + 10 * newCombo;
                    const newBalance = currentState.balance + 0.0001 * newCombo;
                    
                    this.app.updateState({
                        combo: newCombo,
                        maxCombo: newMaxCombo,
                        score: newScore,
                        balance: newBalance
                    });
                    
                    if (newCombo >= 5) {
                        const bonusScore = newScore + 50;
                        this.app.updateState({ score: bonusScore });
                        this.app.modules.ui.showNotification(`COMBO x${newCombo}! +50 bônus`, "success");
                    }
                    
                    this.resetBullet();
                    break;
                }
            }
        }
        
        // Verificar se nível foi completado
        const activeBubbles = this.bubbles.filter(b => b.active).length;
        if (activeBubbles === 0) {
            const currentState = this.app.getState();
            const newLevel = currentState.level + 1;
            const newScore = currentState.score + 100 * newLevel;
            const newBalance = currentState.balance + 0.001 * newLevel;
            
            this.app.updateState({
                level: newLevel,
                score: newScore,
                balance: newBalance
            });
            
            this.app.modules.audio.playSound('level');
            this.app.modules.ui.showNotification(`Level ${newLevel} completo! +${100 * newLevel} pontos`, "success");
            this.generateLevel();
            this.resetBullet();
        }
    }

    draw() {
        const state = this.app.getState();
        if (!state.gameRunning || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fundo gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 10, 20, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 20, 40, 0.4)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grade de fundo (se ativada)
        if (window.showGrid) {
            this.ctx.strokeStyle = 'rgba(0, 255, 170, 0.15)';
            this.ctx.lineWidth = 1;
            for(let x = 0; x < this.canvas.width; x += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            for(let y = 0; y < this.canvas.height; y += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        }
        
        // Desenhar bolhas
        this.bubbles.forEach(b => {
            if (!b.active) return;
            
            const glow = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.5);
            glow.addColorStop(0, b.color);
            glow.addColorStop(0.7, b.color.replace(')', ', 0.7)').replace('rgb', 'rgba'));
            glow.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.fillStyle = glow;
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Reflexo na bolha
            this.ctx.beginPath();
            this.ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.fill();
            
            // Brilho extra
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r * 1.1, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
        
        // Desenhar projétil
        if (this.bullet.active || this.isCharging) {
            const bulletGlow = this.ctx.createRadialGradient(
                this.bullet.x, this.bullet.y, 0,
                this.bullet.x, this.bullet.y, this.bullet.r * 2
            );
            bulletGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            bulletGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            bulletGlow.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.arc(this.bullet.x, this.bullet.y, this.bullet.r * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = bulletGlow;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(this.bullet.x, this.bullet.y, this.bullet.r, 0, Math.PI * 2);
            this.ctx.fillStyle = this.bullet.color;
            this.ctx.fill();
            
            // Reflexo no projétil
            this.ctx.beginPath();
            this.ctx.arc(this.bullet.x - this.bullet.r * 0.3, this.bullet.y - this.bullet.r * 0.3, this.bullet.r * 0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.fill();
            
            if (this.isCharging) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.bullet.x, this.bullet.y);
                this.ctx.lineTo(this.mouseX, this.mouseY);
                this.ctx.strokeStyle = 'rgba(0, 255, 170, 0.4)';
                this.ctx.setLineDash([5, 5]);
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
        
        if (this.isCharging && this.power > 0) {
            const powerRadius = this.power * 2;
            this.ctx.beginPath();
            this.ctx.arc(this.bullet.x, this.bullet.y, powerRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, ${255 - (this.power * 10)}, 0, 0.5)`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}