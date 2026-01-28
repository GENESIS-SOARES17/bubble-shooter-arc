// customization.js - Sistema de personalização

export class Customization {
    constructor(app) {
        this.app = app;
        this.themes = {
            default: {
                bodyBg: 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(0, 26, 26, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(0,0,0,0.8), rgba(20,20,20,0.8))',
                bubbleColors: ['#00ffaa', '#00aaff', '#ffaa00', '#ff4444', '#aa00ff']
            },
            space: {
                bodyBg: 'linear-gradient(135deg, rgba(0, 0, 51, 0.8) 0%, rgba(0, 0, 102, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(10,10,30,0.8), rgba(0,0,40,0.8))',
                bubbleColors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff8800']
            },
            matrix: {
                bodyBg: 'linear-gradient(135deg, rgba(0, 26, 0, 0.8) 0%, rgba(0, 51, 0, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(0,20,0,0.8), rgba(0,40,0,0.8))',
                bubbleColors: ['#00ff00', '#00aa00', '#00ff88', '#88ff00', '#00ffaa']
            },
            nebula: {
                bodyBg: 'linear-gradient(135deg, rgba(51, 0, 51, 0.8) 0%, rgba(102, 0, 102, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(40,0,40,0.8), rgba(20,0,60,0.8))',
                bubbleColors: ['#ff00ff', '#ff0088', '#8800ff', '#ff8800', '#00ffff']
            },
            circuits: {
                bodyBg: 'linear-gradient(135deg, rgba(26, 0, 26, 0.8) 0%, rgba(51, 0, 51, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(20,0,20,0.8), rgba(40,0,40,0.8))',
                bubbleColors: ['#ff5500', '#ffaa00', '#00aaff', '#aa00ff', '#00ffaa']
            },
            abstract: {
                bodyBg: 'linear-gradient(135deg, rgba(51, 26, 0, 0.8) 0%, rgba(102, 51, 0, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(30,10,0,0.8), rgba(50,20,0,0.8))',
                bubbleColors: ['#ff0066', '#00ccff', '#ffcc00', '#66ff00', '#cc00ff']
            },
            solid_black: {
                bodyBg: 'rgba(0, 0, 0, 0.8)',
                gameBg: 'linear-gradient(145deg, rgba(0,0,0,0.8), rgba(10,10,10,0.8))',
                bubbleColors: ['#00ffaa', '#00aaff', '#ffaa00', '#ff4444', '#aa00ff']
            },
            solid_blue: {
                bodyBg: 'rgba(0, 0, 48, 0.8)',
                gameBg: 'linear-gradient(145deg, rgba(0,0,48,0.8), rgba(0,0,96,0.8))',
                bubbleColors: ['#00ffff', '#0088ff', '#00ffaa', '#ff8800', '#ff00ff']
            },
            solid_purple: {
                bodyBg: 'rgba(10, 0, 26, 0.8)',
                gameBg: 'linear-gradient(145deg, rgba(10,0,26,0.8), rgba(26,0,58,0.8))',
                bubbleColors: ['#aa00ff', '#ff00aa', '#00ffaa', '#ffaa00', '#00aaff']
            },
            gradient_blue: {
                bodyBg: 'linear-gradient(135deg, rgba(0, 0, 102, 0.8) 0%, rgba(0, 0, 51, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(0,0,50,0.8), rgba(0,0,80,0.8))',
                bubbleColors: ['#00aaff', '#0088ff', '#0066ff', '#0044ff', '#0022ff']
            },
            gradient_green: {
                bodyBg: 'linear-gradient(135deg, rgba(0, 51, 0, 0.8) 0%, rgba(0, 26, 0, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(0,30,0,0.8), rgba(0,50,0,0.8))',
                bubbleColors: ['#00ff88', '#00dd66', '#00bb44', '#009922', '#007700']
            },
            gradient_red: {
                bodyBg: 'linear-gradient(135deg, rgba(102, 0, 0, 0.8) 0%, rgba(51, 0, 0, 0.8) 100%)',
                gameBg: 'linear-gradient(145deg, rgba(50,0,0,0.8), rgba(80,0,0,0.8))',
                bubbleColors: ['#ff4444', '#ff2222', '#ff0000', '#dd0000', '#bb0000']
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tema do fundo
        const bgSelect = document.getElementById('gameBgSelect');
        if (bgSelect) {
            bgSelect.addEventListener('change', (e) => this.applyTheme(e.target.value));
        }

        // Cor das bolhas
        const bubbleColor = document.getElementById('bubbleColor');
        if (bubbleColor) {
            bubbleColor.addEventListener('input', (e) => this.saveBubbleColor(e.target.value));
        }

        // Efeitos visuais
        const effects = {
            toggleParticleBg: 'particleBg',
            toggleBloom: 'bloom',
            toggleGrid: 'grid',
            toggleShadows: 'shadows'
        };

        Object.entries(effects).forEach(([id, effect]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => this.toggleEffect(effect, button));
            }
        });

        // Redefinir personalização
        const resetBtn = document.getElementById('resetCustomization');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAll());
        }
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        document.body.style.background = theme.bodyBg;
        document.getElementById('gameContainer').style.background = theme.gameBg;
        localStorage.setItem('arcTheme', themeName);
        
        this.app.modules.ui.showNotification(`Tema "${themeName}" aplicado!`, "success");
    }

    saveBubbleColor(color) {
        localStorage.setItem('bubbleColor', color);
        this.app.modules.ui.showNotification(`Cor das bolhas alterada!`, "success");
    }

    toggleEffect(effect, button) {
        let enabled = false;
        
        switch(effect) {
            case 'particleBg':
                enabled = this.app.modules.particles.toggleBackground();
                button.textContent = enabled ? '🌟 Desativar Fundo Animado' : '🌟 Fundo Animado';
                button.classList.toggle('active', enabled);
                this.app.modules.ui.showNotification(
                    enabled ? 'Fundo animado ativado!' : 'Fundo animado desativado', 
                    enabled ? "success" : "info"
                );
                break;
                
            case 'bloom':
                const canvas = document.getElementById('game');
                enabled = !canvas.style.filter || canvas.style.filter === 'none';
                canvas.style.filter = enabled ? 
                    'brightness(1.2) contrast(1.1) saturate(1.3)' : 'none';
                button.textContent = enabled ? '💫 Desativar Bloom' : '💫 Efeito Bloom';
                button.classList.toggle('active', enabled);
                this.app.modules.ui.showNotification(
                    enabled ? 'Efeito Bloom ativado!' : 'Efeito Bloom desativado', 
                    enabled ? "success" : "info"
                );
                break;
                
            case 'grid':
                window.showGrid = !window.showGrid;
                enabled = window.showGrid;
                button.textContent = enabled ? '🔲 Desativar Grade' : '🔲 Grade de Fundo';
                button.classList.toggle('active', enabled);
                this.app.modules.ui.showNotification(
                    enabled ? 'Grade de fundo ativada!' : 'Grade de fundo desativada', 
                    enabled ? "success" : "info"
                );
                break;
                
            case 'shadows':
                const elements = document.querySelectorAll('.stats, .bar-wrap, .calculator-container, .customization-section');
                enabled = !elements[0]?.style.boxShadow || elements[0].style.boxShadow !== 'none';
                
                elements.forEach(el => {
                    if (enabled) {
                        el.style.boxShadow = 'none';
                    } else {
                        if (el.classList.contains('stats') || el.classList.contains('bar-wrap')) {
                            el.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 15px rgba(0,255,170,0.2)';
                        } else {
                            el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)';
                        }
                    }
                });
                
                button.textContent = enabled ? '👥 Sombras' : '👥 Desativar Sombras';
                button.classList.toggle('active', !enabled);
                this.app.modules.ui.showNotification(
                    !enabled ? 'Sombras ativadas!' : 'Sombras desativadas', 
                    !enabled ? "success" : "info"
                );
                break;
        }
        
        localStorage.setItem(`${effect}Enabled`, enabled);
    }

    resetAll() {
        if (confirm("Tem certeza que deseja redefinir todas as personalizações?")) {
            localStorage.removeItem('arcTheme');
            localStorage.removeItem('bubbleColor');
            localStorage.removeItem('bloomEnabled');
            localStorage.removeItem('particleBgEnabled');
            localStorage.removeItem('showGrid');
            localStorage.removeItem('showShadows');
            
            // Resetar para padrão
            document.body.style.background = this.themes.default.bodyBg;
            document.getElementById('gameContainer').style.background = this.themes.default.gameBg;
            
            const canvas = document.getElementById('game');
            if (canvas) canvas.style.filter = 'none';
            
            // Resetar controles
            const bgSelect = document.getElementById('gameBgSelect');
            if (bgSelect) bgSelect.value = 'default';
            
            const bubbleColor = document.getElementById('bubbleColor');
            if (bubbleColor) bubbleColor.value = '#00ffaa';
            
            // Resetar botões de efeitos
            const effectButtons = {
                toggleParticleBg: '🌟 Fundo Animado',
                toggleBloom: '💫 Efeito Bloom',
                toggleGrid: '🔲 Grade de Fundo',
                toggleShadows: '👥 Sombras'
            };
            
            Object.entries(effectButtons).forEach(([id, text]) => {
                const button = document.getElementById(id);
                if (button) {
                    button.textContent = text;
                    button.classList.remove('active');
                }
            });
            
            // Desativar fundo animado
            this.app.modules.particles.removeBackground();
            
            // Restaurar sombras
            const elements = document.querySelectorAll('.stats, .bar-wrap, .calculator-container, .customization-section');
            elements.forEach(el => {
                if (el.classList.contains('stats') || el.classList.contains('bar-wrap')) {
                    el.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 15px rgba(0,255,170,0.2)';
                } else {
                    el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)';
                }
            });
            
            // Resetar estado
            window.showGrid = true;
            
            this.app.modules.ui.showNotification('Personalização redefinida!', "success");
        }
    }

    loadPreferences() {
        const savedTheme = localStorage.getItem('arcTheme');
        const savedBubbleColor = localStorage.getItem('bubbleColor');
        const savedBloom = localStorage.getItem('bloomEnabled');
        const savedParticleBg = localStorage.getItem('particleBgEnabled');
        const savedGrid = localStorage.getItem('showGrid');
        const savedShadows = localStorage.getItem('showShadows');
        
        // Carregar tema
        if (savedTheme && this.themes[savedTheme]) {
            this.applyTheme(savedTheme);
            const bgSelect = document.getElementById('gameBgSelect');
            if (bgSelect) bgSelect.value = savedTheme;
        }
        
        // Carregar cor das bolhas
        if (savedBubbleColor) {
            const bubbleColor = document.getElementById('bubbleColor');
            if (bubbleColor) bubbleColor.value = savedBubbleColor;
        }
        
        // Carregar efeito Bloom
        if (savedBloom === 'true') {
            const canvas = document.getElementById('game');
            if (canvas) {
                canvas.style.filter = 'brightness(1.2) contrast(1.1) saturate(1.3)';
                const bloomBtn = document.getElementById('toggleBloom');
                if (bloomBtn) {
                    bloomBtn.textContent = '💫 Desativar Bloom';
                    bloomBtn.classList.add('active');
                }
            }
        }
        
        // Carregar fundo animado
        if (savedParticleBg === 'true') {
            this.app.modules.particles.initBackground();
            const particleBtn = document.getElementById('toggleParticleBg');
            if (particleBtn) {
                particleBtn.textContent = '🌟 Desativar Fundo Animado';
                particleBtn.classList.add('active');
            }
        }
        
        // Carregar grade
        if (savedGrid === 'false') {
            window.showGrid = false;
            const gridBtn = document.getElementById('toggleGrid');
            if (gridBtn) {
                gridBtn.textContent = '🔲 Grade de Fundo';
                gridBtn.classList.remove('active');
            }
        }
        
        // Carregar sombras
        if (savedShadows === 'false') {
            const shadowsBtn = document.getElementById('toggleShadows');
            if (shadowsBtn) {
                shadowsBtn.textContent = '👥 Sombras';
                shadowsBtn.classList.remove('active');
            }
            
            const elements = document.querySelectorAll('.stats, .bar-wrap, .calculator-container, .customization-section');
            elements.forEach(el => {
                el.style.boxShadow = 'none';
            });
        }
    }
}