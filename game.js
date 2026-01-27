// Dados da sua rede ARC TST
const ARC_CHAIN_ID = "0x4cece6"; // ID 5042002 em Hexadecimal
const ARC_RPC_URL = "https://rpc.testnet.arc.network";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const connectBtn = document.getElementById('connect-button');

// --- FUNÇÃO DE CONEXÃO REVISADA ---
async function connectWallet() {
    if (window.ethereum) {
        try {
            // 1. Pede permissão para ver a carteira
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // 2. Tenta trocar para a rede Arc automaticamente
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ARC_CHAIN_ID }],
                });
            } catch (switchError) {
                // Se a rede não estiver na MetaMask, ele tenta adicionar
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
            
            // 3. Atualiza a tela se der tudo certo
            statusText.innerText = "Status: Conectado (" + accounts[0].substring(0,6) + "...)";
            statusText.style.color = "#00ff88";
            connectBtn.innerHTML = "CARTEIRA ATIVA";
            connectBtn.style.background = "#333";

        } catch (error) {
            console.log("Erro silencioso de conexão:", error);
            // Removemos o alerta chato para não travar o seu jogo
        }
    } else {
        alert("Instale a MetaMask para usar a rede ARC!");
    }
}

connectBtn.onclick = connectWallet;

// --- VISUAL DO ARCADE (Inspirado na sua imagem) ---
const colors = ['#00d4ff', '#ff0055', '#00ff88', '#ffcc00', '#9d00ff'];
let bubbles = [];

function initGrid() {
    bubbles = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            bubbles.push({
                x: 40 + (col * 45),
                y: 50 + (row * 40),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bolhas do topo
    bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.stroke();
        ctx.closePath();
    });

    // Bolha Atiradora (Central)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 50, 22, 0, Math.PI * 2);
    ctx.fillStyle = "yellow"; 
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.closePath();
}

initGrid();
setInterval(draw, 50);