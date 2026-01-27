const ARC_CHAIN_ID = "0x4cece6"; // 5042002
const ARC_RPC = "https://rpc.testnet.arc.network";

// Função para forçar a atualização visual
function forceUpdateUI(account, chainId) {
    const statusText = document.getElementById('status');
    const btn = document.getElementById('connect-button');

    if (account && chainId === ARC_CHAIN_ID) {
        statusText.innerText = "Status: CONECTADO (" + account.substring(0, 6) + ")";
        statusText.style.color = "#00ff88"; // Verde vivo
        btn.innerText = "CARTEIRA ATIVA";
        btn.style.opacity = "0.5";
    } else if (account && chainId !== ARC_CHAIN_ID) {
        statusText.innerText = "Status: TROQUE PARA REDE ARC";
        statusText.style.color = "orange";
    } else {
        statusText.innerText = "Status: Desconectado";
        statusText.style.color = "white";
    }
}

// Monitor de eventos da MetaMask (O segredo para funcionar)
if (window.ethereum) {
    // Escuta troca de conta
    window.ethereum.on('accountsChanged', (accounts) => {
        window.location.reload(); // Recarrega para garantir limpeza de cache
    });

    // Escuta troca de rede
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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
            const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
            forceUpdateUI(accounts[0], currentChain);
        } catch (error) {
            console.log("Erro ao autorizar");
        }
    }
}

document.getElementById('connect-button').onclick = connectWallet;

// Verifica estado ao carregar a página
window.onload = async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (accounts.length > 0) {
            forceUpdateUI(accounts[0], chainId);
        }
    }
};

// --- DESENHO ARCADE (Fiel à sua imagem) ---
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
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.stroke();
        }
    }
    // Bolha Atiradora amarela central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 50, 22, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
}
setInterval(draw, 50);