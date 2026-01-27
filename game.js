// Configurações da Rede Arc Testnet
const ARC_CHAIN_ID = '0x4cece6'; // 5042002 em Hexadecimal
const USDC_TOKEN = "0x3600000000000000000000000000000000000000";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const connectBtn = document.getElementById('connect-button');
const statusText = document.getElementById('status');

// --- 1. CONEXÃO WEB3 (CORRIGIDA) ---
async function connectWallet() {
    if (window.ethereum) {
        try {
            // Solicita acesso à conta
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            statusText.innerText = "Conectado: " + accounts[0].substring(0, 6) + "...";

            // Tenta mudar para a rede Arc ou adicioná-la se não existir
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ARC_CHAIN_ID }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: ARC_CHAIN_ID,
                            chainName: 'Arc Testnet',
                            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                            rpcUrls: ['https://rpc.testnet.arc.network'],
                            blockExplorerUrls: ['https://explorer.testnet.arc.network']
                        }],
                    });
                }
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar à carteira.");
        }
    } else {
        alert("Por favor, instale a MetaMask!");
    }
}

if(connectBtn) connectBtn.onclick = connectWallet;

// --- 2. LÓGICA DO JOGO ARCADE ---
let bubbles = [];
const colors = ['#00d4ff', '#ff0055', '#00ff88', '#ffcc00', '#9d00ff'];

// Criar grade de bolhas (inspirado na sua imagem)
function createGrid() {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            bubbles.push({
                x: 45 + col * 45,
                y: 50 + row * 40,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar bolhas no topo
    bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        // Brilho da bolha
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
        ctx.closePath();
    });

    // Desenhar Bolha Atiradora (A de baixo)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 40, 22, 0, Math.PI * 2);
    ctx.fillStyle = "yellow"; // Cor de destaque
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";
    ctx.closePath();
}

createGrid();
setInterval(draw, 30);