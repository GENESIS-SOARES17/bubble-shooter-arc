// particleSystem.js - Sistema de partículas

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.animationId = null;
        this.particlePool = [];
        this.maxParticles = 100;
    }

    createParticles(x, y, color, count = 8) {
        const container = document.getElementById('particleContainer');
        if (!container) return;
        
        for(let i = 0; i < count; i++) {
            const particle = this.getParticle();
            
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 5 + 2;
            const life = Math.random() * 20 + 20;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = color;
            particle.style.boxShadow = `0 0 ${size}px ${color}`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.opacity = '1';
            
            container.appendChild(particle);
            
            let frame = 0;
            const animateParticle = () => {
                frame++;
                const progress = frame / life;
                
                if (progress >= 1) {
                    this.recycleParticle(particle);
                    return;
                }
                
                const currentX = x + Math.cos(angle) * velocity * frame;
                const currentY = y + Math.sin(angle) * velocity * frame;
                const currentSize = size * (1 - progress);
                const currentOpacity = 1 - progress;
                
                particle.style.left = `${currentX}px`;
                particle.style.top = `${currentY}px`;
                particle.style.width = `${currentSize}px`;
                particle.style.height = `${currentSize}px`;
                particle.style.opacity = currentOpacity;
                
                requestAnimationFrame(animateParticle);
            };
            
            animateParticle();
        }
    }

    getParticle() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.borderRadius = '50%';
        particle.style.zIndex = '2';
        return particle;
    }

    recycleParticle(particle) {
        particle.remove();
        if (this.particlePool.length < this.maxParticles) {
            this.particlePool.push(particle);
        }
    }

    initBackground() {
        const canvas = document.getElementById('particleBackground');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Criar partículas
        this.particles = [];
        const particleCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 15000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                color: `rgba(${Math.random() * 100}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 0.3 + 0.1})`
            });
        }
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Atualizar e desenhar partículas
            for (let particle of this.particles) {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Rebater nas bordas
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
                
                // Desenhar partícula
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                
                // Linhas entre partículas próximas
                for (let otherParticle of this.particles) {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 255, 170, ${0.1 * (1 - distance/80)})`;
                        ctx.lineWidth = 0.3;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                }
            }
            
            this.animationId = requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
        
        // Redimensionar
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    removeBackground() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        const canvas = document.getElementById('particleBackground');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    toggleBackground() {
        if (this.animationId) {
            this.removeBackground();
            return false;
        } else {
            this.initBackground();
            return true;
        }
    }
}