// Configurações da rede ARC TST enviadas por você
const ARC_RPC_URL = "https://rpc.testnet.arc.network";
const ARC_CHAIN_ID = "0x4cece6"; // Hexadecimal para 5042002
const USDC_CONTRACT = "0x3600000000000000000000000000000000000000";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const connectBtn = document.getElementById('connect-button');

// --- SISTEMA DE CONEXÃO WEB3 ---
async function connectWallet() {
    if (window.ethereum) {
        try {
            // Tenta conectar a conta
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Tenta mudar para a rede Arc ou adicioná-la se não existir
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ARC_CHAIN_ID }],
                });
            } catch (switchError) {
                // Erro 4902: a rede não está cadastrada na MetaMask
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
                } else {
                    throw switchError;
                }
            }
            
            statusText.innerText = "Conectado na Arc: " + accounts[0].substring(0,6) + "...";
            connectBtn.style.display = "none"; // Esconde o botão após conectar

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar na Arc Testnet. Verifique sua MetaMask!");
        }
    } else {
        alert("Instale a MetaMask para jogar!");
    }
}

connectBtn.onclick = connectWallet;

// --- LÓGICA VISUAL DO BUBBLE SHOOTER ---
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
let bubbles = [];

// Cria a grade inicial (inspirada na imagem enviada)
function initGame() {
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

    // Desenha as bolhas do topo
    bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        // Detalhe de luz na bolha
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    });

    // Desenha a bolha de disparo (Arco-íris na imagem)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 50, 22, 0, Math.PI * 2);
    let gradient = ctx.createRadialGradient(250, 450, 5, 250, 450, 25);
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(1, "orange");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

initGame();
setInterval(draw, 100); // Atualiza o desenho a cada 100ms