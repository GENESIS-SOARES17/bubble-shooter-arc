const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME STATE ---
let score = 0;
let bubbles = [];
let particles = []; // For explosion effects
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bullet = { x: 225, y: 500, radius: 22, color: 'yellow', active: false, dx: 0, dy: 0 };

// --- SOUND SYSTEM (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playPopSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// --- EXPLOSION SYSTEM ---
function createExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            radius: Math.random() * 4,
            color: color,
            life: 30 // frames
        });
    }
}

function initGrid() {
    bubbles = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 8; j++) {
            bubbles.push({ x: 45 + (j * 52), y: 60 + (i * 45), radius: 20, color: colors[i % colors.length], active: true });
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (bullet.active) return;
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2((e.clientY - rect.top) - bullet.y, (e.clientX - rect.left) - bullet.x);
    bullet.dx = Math.cos(angle) * 12;
    bullet.dy = Math.sin(angle) * 12;
    bullet.active = true;
    if (audioCtx.state === 'suspended') audioCtx.resume(); // Unlock audio on first click
});

function update() {
    if (bullet.active) {
        bullet.x += bullet.dx; bullet.y += bullet.dy;
        if (bullet.x < bullet.radius || bullet.x > canvas.width - bullet.radius) bullet.dx *= -1;
        
        bubbles.forEach(b => {
            if (b.active) {
                const dist = Math.hypot(bullet.x - b.x, bullet.y - b.y);
                if (dist < bullet.radius + b.radius) {
                    b.active = false;
                    score += 10;
                    playPopSound(); // Play sound
                    createExplosion(b.x, b.y, b.color); // Visual explosion
                    resetBullet();
                }
            }
        });
        if (bullet.y < 0 || bullet.y > canvas.height) resetBullet();
    }

    // Update Particles
    particles.forEach((p, index) => {
        p.x += p.dx; p.y += p.dy; p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });
}

function resetBullet() {
    bullet.active = false; bullet.x = canvas.width / 2; bullet.y = 500;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"; ctx.font = "bold 20px Arial";
    ctx.fillText("SCORE: " + score, 20, 30);

    // Draw Bubbles
    bubbles.forEach(b => {
        if (b.active) {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color; ctx.fill(); ctx.closePath();
        }
    });

    // Draw Particles (Explosions)
    particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 30; ctx.fill();
        ctx.globalAlpha = 1; ctx.closePath();
    });

    // Draw Bullet
    ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color; ctx.fill(); ctx.closePath();

    requestAnimationFrame(draw);
}

initGrid();
setInterval(update, 1000 / 60);
draw();
