const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CARREGAMENTO DE MÚLTIPLAS IMAGENS ---
const bubbleImages = {};
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
const colorNames = {
    '#00BFFF': 'blue',
    '#FF1493': 'pink',
    '#32CD32': 'green',
    '#FFD700': 'yellow',
    '#FF4500': 'orange'
};

// Carrega as imagens para cada cor
colors.forEach(color => {
    const img = new Image();
    img.src = `${colorNames[color]}.png`; // Busca blue.png, pink.png, etc.
    bubbleImages[color] = img;
});

const shooterImg = new Image();
shooterImg.src = 'shooter.png';

// --- ESTADO DO JOGO ---
let score = 0;
let level = 1;
let bubbles = [];
let particles = [];
let bullet = { x: 225, y: 500, radius: 22, active: false, dx: 0, dy: 0 };

// --- ÁUDIO E WEB3 ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playPopSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// --- LOGICA DE FASES ---
function initLevel(lvl) {
    bubbles = [];
    const rows = 3 + lvl;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 8; j++) {
            bubbles.push({
                x: 45 + (j * 52),
                y: 60 + (i * 45),
                radius: 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                active: true
            });
        }
    }
}

// --- DISPARO E ATUALIZAÇÃO ---
canvas.addEventListener('mousedown', (e) => {
    if (bullet.active) return;
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2((e.clientY - rect.top) - bullet.y, (e.clientX - rect.left) - bullet.x);
    bullet.dx = Math.cos(angle) * (10 + level);
    bullet.dy = Math.sin(angle) * (10 + level);
    bullet.active = true;
});

function update() {
    if (bullet.active) {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (bullet.x < 20 || bullet.x > canvas.width - 20) bullet.dx *= -1;

        bubbles.forEach(b => {
            if (b.active) {
                const dist = Math.hypot(bullet.x - b.x, bullet.y - b.y);
                if (dist < bullet.radius + b.radius) {
                    b.active = false;
                    score += 10;
                    playPopSound();
                    bullet.active = false;
                    bullet.x = canvas.width / 2;
                    bullet.y = 510;
                }
            }
        });
        if (bullet.y < 0 || bullet.y > canvas.height) {
            bullet.active = false; bullet.x = canvas.width / 2; bullet.y = 510;
        }
    }
    if (bubbles.length > 0 && bubbles.every(b => !b.active)) {
        level++; initLevel(level);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`LEVEL: ${level}  SCORE: ${score}`, 20, 30);

    // DESENHAR BOLHAS COM IMAGENS DIFERENTES
    bubbles.forEach(b => {
        if (b.active) {
            const img = bubbleImages[b.color];
            if (img && img.complete) {
                ctx.drawImage(img, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
            } else {
                ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color; ctx.fill(); ctx.closePath();
            }
        }
    });

    // DESENHAR ATIRADOR
    if (shooterImg.complete) {
        ctx.drawImage(shooterImg, bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2);
    } else {
        ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = "yellow"; ctx.fill(); ctx.closePath();
    }
    requestAnimationFrame(draw);
}

initLevel(level);
setInterval(update, 1000 / 60);
draw();

