const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";

// Função para atualizar o status na tela
function updateStatus(account) {
    const statusElement = document.getElementById('status');
    const connectBtn = document.getElementById('connect-button');
    
    if (account) {
        statusElement.innerText = "Status: Conectado (" + account.substring(0, 6) + "...)";
        statusElement.style.color = "#00ff88"; // Verde Neon
        connectBtn.innerText = "CARTEIRA ATIVA";
        connectBtn.style.background = "#333";
    } else {
        statusElement.innerText = "Status: Desconectado";
        statusElement.style.color = "white";
        connectBtn.innerText = "Conectar Carteira";
    }
}

// Verifica conexão automaticamente a cada 1 segundo
async function checkConnection() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId === ARC_CHAIN_ID) {
                updateStatus(accounts[0]);
            } else {
                document.getElementById('status').innerText = "Status: Troque para a rede Arc";
                document.getElementById('status').style.color = "yellow";
            }
        }
    }
}
setInterval(checkConnection, 1000);

// Função do Botão (mesma de antes)
async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ARC_CHAIN_ID }],
                });
            } catch (err) {
                if (err.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: ARC_CHAIN_ID,
                            chainName: 'Arc Testnet',
                            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                            rpcUrls: [ARC_RPC],
                            blockExplorerUrls: ['https://explorer.testnet.arc.network']
                        }],
                    });
                }
            }
        } catch (error) {
            console.log("Erro ao conectar.");
        }
    }
}

document.getElementById('connect-button').onclick = connectWallet;

// Lógica Visual do Jogo (Sua imagem 301cda)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];
    for(let i=0; i<5; i++) {
        for(let j=0; j<8; j++) {
            ctx.beginPath();
            ctx.arc(40 + j*45, 50 + i*40, 18, 0, Math.PI*2);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.stroke();
        }
    }
    // Bolha Atiradora amarela centralizada
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 50, 22, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
}
setInterval(draw, 50);