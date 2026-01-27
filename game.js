const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CARREGAMENTO DE IMAGENS ---
const bubbleImages = {};
// REMOVIDO O VERMELHO DA LISTA
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700']; 
const colorNames = {
    '#00BFFF': 'blue',
    '#FF1493': 'pink',
    '#32CD32': 'green',
    '#FFD700': 'yellow'
};

colors.forEach(color => {
    const img = new Image();
    img.src = colorNames[color] + '.png'; 
    bubbleImages[color] = img;
});

const shooterImg = new Image();
shooterImg.src = 'shooter.png';

// --- ESTADO DO JOGO ---
let score = 0;
let level = 1;
let bubbles = [];
let bullet = { x: 225, y: 500, radius: 20, active: false, dx: 0, dy: 0 };

// --- WEB3 ---
async function checkWallet() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const statusText = document.getElementById('status');
        if (accounts.length > 0) {
            statusText.innerText = "STATUS: CONECTADO (" + accounts[0].substring(0, 6) + ")";
            statusText.style.color = "#00ff88";
            document.getElementById('connect-button').style.display = "none";
        }
    }
}

// --- INICIALIZAR COM 6 LINHAS ---
function initLevel(lvl) {
    bubbles = [];
    const rows = 6; // FIXADO EM 6 LINHAS
    const cols = 8;
    for (let i = 0; i < rows; i++) {
        // Escolhe uma cor baseada na linha para ficar organizado
        const colorIndex = i % colors.length; 
        for (let j = 0; j < cols; j++) {
            bubbles.push({
                x: 45 + (j * 52),
                y: 60 + (i * 45),
                radius: 19,
                color: colors[colorIndex],
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
