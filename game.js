const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');

// --- GAME SETTINGS ---
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bubbles = [];
let bullet = { x: 225, y: 500, radius: 20, color: 'yellow', active: false, speedX: 0, speedY: 0 };
let score = 0;

// Create the initial grid
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

// Shooting logic
canvas.addEventListener('click', (e) => {
    if (bullet.active) return; // Wait for the previous shot to finish

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const angle = Math.atan2(mouseY - bullet.y, mouseX - bullet.x);
    bullet.speedX = Math.cos(angle) * 8;
    bullet.speedY = Math.sin(angle) * 8;
    bullet.active = true;
});

function update() {
    if (bullet.active) {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;

        // Wall bounce
        if (bullet.x < 0 || bullet.x > canvas.width) bullet.speedX *= -1;
        if (bullet.y < 0) resetBullet();

        // Collision detection
        bubbles.forEach(b => {
            if (b.alive) {
                let dist = Math.hypot(bullet.x - b.x, bullet.y - b.y);
                if (dist < bullet.radius + b.radius) {
                    b.alive = false; // Destroy bubble
                    score += 10;
                    resetBullet();
                }
            }
        });

        // Reset if bullet goes off bottom
        if (bullet.y > canvas.height) resetBullet();
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
    ctx.font = "16px Arial";
    ctx.fillText("SCORE: " + score, 20, 30);

    // Draw Grid
    bubbles.forEach(b => {
        if (b.alive) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.closePath();
        }
    });

    // Draw Bullet (Shooter)
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game
createGrid();
gameLoop();

// --- WALLET LOGIC (English) ---
// Keep your existing wallet connection code here to maintain the green status