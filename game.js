const ARC_CHAIN_ID = "0x4cece6";
const ARC_RPC = "https://rpc.testnet.arc.network";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME STATE ---
let score = 0;
let bubbles = [];
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bullet = { x: 225, y: 500, radius: 22, color: 'yellow', active: false, dx: 0, dy: 0 };

// --- WALLET CONNECTION ---
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

// --- GAME FUNCTIONS ---
function initGrid() {
    bubbles = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 8; j++) {
            bubbles.push({
                x: 45 + (j * 52),
                y: 60 + (i * 45),
                radius: 20,
                color: colors[i % colors.length],
                active: true
            });
        }
    }
}

// Shooting Mechanics
canvas.addEventListener('mousedown', (e) => {
    if (bullet.active) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const angle = Math.atan2(mouseY - bullet.y, mouseX - bullet.x);
    bullet.dx = Math.cos(angle) * 12; // Speed
    bullet.dy = Math.sin(angle) * 12;
    bullet.active = true;
});

function update() {
    if (bullet.active) {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Wall Bounce
        if (bullet.x < bullet.radius || bullet.x > canvas.width - bullet.radius) {
            bullet.dx *= -1;
        }

        // Collision detection with grid
        bubbles.forEach(b => {
            if (b.active) {
                const dist = Math.hypot(bullet.x - b.x, bullet.y - b.y);
                if (dist < bullet.radius + b.radius) {
                    b.active = false;
                    score += 10;
                    resetBullet();
                }
            }
        });

        // Reset if bullet goes out of bounds
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

    // Draw Score
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText("SCORE: " + score, 20, 30);

    // Draw Bubbles
    bubbles.forEach(b => {
        if (b.active) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.stroke();
            ctx.closePath();
        }
    });

    // Draw Shooter
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.shadowBlur = bullet.active ? 20 : 0;
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
}

// Start everything
initGrid();
checkWallet();
setInterval(update, 1000 / 60); // 60 FPS update
draw(); // Start animation loop