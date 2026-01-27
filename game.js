// Configurações da rede ARC TST fornecidas por você
const ARC_CHAIN_ID = "0x4cece6"; // ID 5042002 em Hexadecimal
const ARC_RPC_URL = "https://rpc.testnet.arc.network";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const connectBtn = document.getElementById('connect-button');

// --- SISTEMA DE CONEXÃO REVISADO ---
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Solicita acesso à conta primeiro
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Tenta mudar para a Arc Testnet de forma segura
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ARC_CHAIN_ID }],
                });
            } catch (switchError) {
                // Se a rede não estiver na MetaMask, solicita para adicionar
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: ARC_CHAIN_ID,
                            chainName: 'Arc Testnet',
                            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                            rpcUrls: [ARC_RPC_URL],
                            blockExplorerUrls: ['https://explorer.testnet.arc.network']
                        }],
                    });
                }
            }

            // Atualização visual de sucesso
            statusText.innerText = "Status: Conectado (" + accounts[0].substring(0,6) + "...)";
            statusText.style.color = "#00ff88";
            connectBtn.innerHTML = "CARTEIRA ATIVA";
            console.log("Conectado com sucesso na rede Arc!");

        } catch (error) {
            // Log no console para evitar o pop-up de erro persistente
            console.error("Erro na conexão:", error);
        }
    } else {
        alert("MetaMask não detectada. Por favor, instale a extensão.");
    }
}

// Atribui a função ao botão
if (connectBtn) {
    connectBtn.onclick = connectWallet;
}

// --- VISUAL DO JOGO ARCADE ---
// Cores baseadas na imagem do jogo enviada
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bubbles = [];

function createGrid() {
    bubbles = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            bubbles.push({
                x: 45 + (col * 44),
                y: 50 + (row * 40),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha a grade de bolhas
    bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
        ctx.closePath();
    });

    // Desenha a bolha de disparo (amarela/colorida)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 50, 22, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.closePath();
}

// Inicializa o visual
createGrid();
setInterval(draw, 50);