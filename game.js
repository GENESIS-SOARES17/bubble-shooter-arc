const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";

async function connectWallet() {
    if (window.ethereum) {
        try {
            // Solicita a conta e aguarda a confirmação do usuário
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];

            // Tenta mudar para a rede Arc
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
                            rpcUrls: [ARC_RPC],
                            blockExplorerUrls: ['https://explorer.testnet.arc.network']
                        }],
                    });
                }
            }

            // AQUI ESTÁ A CORREÇÃO: Atualiza o texto após confirmar
            document.getElementById('status').innerText = "Status: Conectado (" + walletAddress.substring(0, 6) + "...)";
            document.getElementById('status').style.color = "#00ff88"; // Muda para verde
            document.getElementById('connect-button').innerText = "CARTEIRA ATIVA";
            
        } catch (error) {
            console.log("Conexão cancelada pelo usuário.");
        }
    } else {
        alert("Instale a MetaMask!");
    }
}

document.getElementById('connect-button').onclick = connectWallet;

// Mantém o desenho das bolhas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ['#00d4ff', '#ff0055', '#00ff88', '#ffcc00'];
    for(let i=0; i<5; i++) {
        for(let j=0; j<8; j++) {
            ctx.beginPath();
            ctx.arc(45 + j*45, 50 + i*40, 18, 0, Math.PI*2);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.closePath();
        }
    }
    ctx.beginPath();
    ctx.arc(200, 450, 22, 0, Math.PI*2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
}
setInterval(draw, 50);