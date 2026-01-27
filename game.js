// --- CONFIGURAÇÕES DA REDE ARC ---
const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO DO JOGO ---
let score = 0;
let level = 1;
let bubbles = [];
let particles = [];
const baseColors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bullet = { x: 225, y: 500, radius: 20, color: 'yellow', active: false, dx: 0, dy: 0 };
let gameRunning = true;

// --- SISTEMA DE ÁUDIO (Pop Sound) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playPopSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + (level * 50), audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// --- CONEXÃO WEB3 ---
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

async function connect() {
    if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_CHAIN_ID }],
            });
        } catch (e) {
            if (e.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: ARC_CHAIN_ID,
                        chainName: 'Arc Testnet',
                        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                        rpcUrls: [ARC_RPC]
                    }],
                });
            }
        }
        window.location.reload();
    }
}
document.getElementById('connect-button').onclick = connect;

// --- LÓGICA DE FASES ---
function initLevel(lvl) {
    bubbles = [];
    const rows = 3 + lvl; // Mais linhas a cada nível
    const cols = 8;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            bubbles.push({
                x: 45 + (j * 52),
                y: 60 + (i * 45),
                radius: 18,
                color: baseColors[Math.floor(Math.random() * Math.min(baseColors.length, 2 + lvl))],
                active: true
            });
        }
    }
    bullet.active = false;
    bullet.x = canvas.width / 2;
    bullet.y = 510;
}

// --- EXPLOSÕES ---
function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x, y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 5,
            color: color,
            life: 25
        });
    }
}

// --- LOOP DO JOGO ---
canvas.addEventListener('mousedown', (e) => {
    if (bullet.active || !gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2((e.clientY - rect.top) - bullet.y, (e.clientX - rect.left) - bullet.x);
    bullet.dx = Math.cos(angle) * (10 + level); // Mais rápido conforme o nível
    bullet.dy = Math.sin(angle) * (10 + level);
    bullet.active = true;
    if (audioCtx.state === 'suspended') audioCtx.resume();
});

function update() {
    if (!gameRunning) return;

    if (bullet.active) {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Bordas
        if (bullet.x < 20 || bullet.x > canvas.width - 20) bullet.dx *= -1;

        // Colisão
        bubbles.forEach(b => {
            if (b.active) {
                const dist = Math.hypot(bullet.x - b.x, bullet.y - b.y);
                if (dist < bullet.radius + b.radius) {
                    b.active = false;
                    score += 10 * level;
                    playPopSound();
                    createExplosion(b.x, b.y, b.color);
                    bullet.active = false;
                    bullet.x = canvas.width / 2;
                    bullet.y = 510;
                }
            }
        });

        if (bullet.y < 0 || bullet.y > canvas.height) {
            bullet.active = false;
            bullet.x = canvas.width / 2;
            bullet.y = 510;
        }
    }

    // Partículas
    particles.forEach((p, i) => {
        p.x += p.dx; p.y += p.dy; p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    });

    // Verificar se passou de fase
    if (bubbles.length > 0 && bubbles.every(b => !b.active)) {
        level++;
        initLevel(level);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // UI - Score e Level
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`LEVEL: ${level}`, 20, 30);
    ctx.fillText(`SCORE: ${score}`, canvas.width - 120, 30);

    // Bolhas
    bubbles.forEach(b => {
        if (b.active) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.stroke();
            ctx.closePath();
        }
    });

    // Partículas
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 25;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.closePath();
    });

    // Atirador
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.shadowBlur = bullet.active ? 15 : 0;
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();

    requestAnimationFrame(draw);
}

// Iniciar
initLevel(level);
checkWallet();
setInterval(update, 1000 / 60);
draw();
