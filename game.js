const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const connectBtn = document.getElementById('connect-button');
const statusText = document.getElementById('status');

// Dados da Rede Arc que você passou
const ARC_CHAIN_ID = '0x4cece6'; // 5042002 em Hexadecimal
const USDC_CONTRACT = "0x3600000000000000000000000000000000000000";

// --- LOGICA DA BLOCKCHAIN ---
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            statusText.innerText = "Status: Conectado - " + accounts[0].substring(0,6) + "...";
            
            // Verificar se está na rede certa
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_CHAIN_ID }],
            });
        } catch (error) {
            alert("Erro ao conectar na Arc Testnet");
        }
    } else {
        alert("Instale a MetaMask!");
    }
}

connectBtn.onclick = connectWallet;

// --- LOGICA DO JOGO (SIMPLIFICADA) ---
let ballX = 200;
let ballY = 450;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha uma "bolha" de exemplo (colorida como a da sua foto)
    ctx.beginPath();
    ctx.arc(ballX, ballY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "yellow"; 
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.fillText("Mecânica de Jogo Ativa", 150, 250);
}

setInterval(draw, 10);