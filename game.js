const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CARREGAMENTO DE IMAGENS ---
const bubbleImages = {};
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
const colorNames = {
    '#00BFFF': 'blue',
    '#FF1493': 'pink',
    '#32CD32': 'green',
    '#FFD700': 'yellow',
    '#FF4500': 'orange'
};

// Carrega as imagens para cada cor com fallback
colors.forEach(color => {
    const img = new Image();
    // Tente manter tudo em minúsculo no seu GitHub
    img.src = colorNames[color] + '.png'; 
    bubbleImages[color] = img;
});

const shooterImg = new Image();
shooterImg.src = 'shooter.png';

// --- ESTADO DO JOGO ---
let score = 0;
let level = 1;
let bubbles = [];
let particles = [];
let bullet = { x: 225, y: 500, radius: 20, active: false, dx: 0, dy: 0 };

// --- WEB3 E CONEXÃO ---
async function checkWallet() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const statusText = document.getElementById('status');
        if (accounts.length > 0 && chainId === ARC_CHAIN_ID) {
            statusText.innerText = "STATUS: CONNECTED (" + accounts[0].substring(0, 6) + ")";
            statusText.style.color = "#00ff88";
            document.getElementById('connect-button').style.display = "none";
        }
    }
}

// --- LÓGICA DO JOGO ---
function initLevel(lvl) {
    bubbles = [];
    const rows = 2 + lvl;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 8; j++) {
            bubbles.push({
                x: 45 + (j * 52),
                y: 60 + (i * 45),
                radius: 19,
                color: colors[Math.floor(Math.random() * colors.length)],
                active: true
            });
        }
    }
}

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

    bubbles.forEach(b => {
        if (b.active) {
            const img = bubbleImages[b.color];
            // Lógica de desenhar imagem OU círculo se a imagem falhar
            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
            } else {
                ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color; ctx.fill(); ctx.closePath();
            }
        }
    });

    if (shooterImg.complete && shooterImg.naturalWidth !== 0) {
        ctx.drawImage(shooterImg, bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2);
    } else {
        ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = "yellow"; ctx.fill(); ctx.closePath();
    }
    requestAnimationFrame(draw);
}

initLevel(level);
setInterval(update, 1000 / 60);
checkWallet();
draw();