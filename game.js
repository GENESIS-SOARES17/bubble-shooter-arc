const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";

// --- GAME STATE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bubbles = [];
let bullet = { x: 225, y: 500, radius: 20, color: 'yellow', active: false, speedX: 0, speedY: 0 };
let score = 0;

// --- WALLET LOGIC ---
async function updateWalletUI() {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const statusText = document.getElementById('status');
    const btn = document.getElementById('connect-button');

    if (accounts.length > 0 && chainId === ARC_CHAIN_ID) {
        statusText.innerText = "STATUS: CONNECTED (" + accounts[0].substring(0, 6) + ")";
        statusText.style.color = "#00ff88";
        btn.innerText = "WALLET ACTIVE";
        btn.style.opacity = "0.5";
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
        } catch (e) { /* Add network logic if needed */ }
        updateWalletUI();
    }
}
document.getElementById('connect-button').onclick = connect;

// --- GAME LOGIC ---
function createGrid() {
    bubbles = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            bubbles.push({
                x: 45 + (col * 52),
                y: 50 + (row * 45),
                radius: 19,
                color: colors[row % colors.length],
                alive: true
            });
        }
    }
}

// Shooting - Click to fire
canvas.addEventListener('mousedown', (e) => {
    if (bullet.active) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const angle = Math.atan2(mouseY - bullet.y, mouseX - bullet.x);
    bullet.speedX = Math.cos(angle) * 10;
    bullet.speedY = Math.sin(angle) * 10;
    bullet.active = true;
});

function update() {
    if (bullet.active) {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;

        // Bounce off walls
        if (bullet.x < 20 || bullet.x > canvas.width - 20) bullet.speedX *= -1;
        
        // Check collisions with grid
        bubbles.forEach(b => {
            if (b.alive) {
                let dist = Math.hypot(bullet.x - b.x, bullet.y - b.y);
                if (dist < bullet.radius + b.radius) {
                    b.alive = false;
                    score += 10;
                    resetBullet();
                }
            }
        });

        // Reset if bullet leaves screen
        if (bullet.y < 0 || bullet.y > canvas.height) resetBullet();
    }
}

function resetBullet() {
    bullet.active = false;
    bullet.x = canvas.width / 2;
    bullet.y = 500;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Score
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.fillText("SCORE: " + score, 20, 30);

    // Grid
    bubbles.forEach(b => {
        if (b.alive) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.stroke();
        }
    });

    // Bullet
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.shadowBlur = bullet.active ? 20 : 0;
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.shadowBlur = 0;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Initialize everything
createGrid();
updateWalletUI();
loop();