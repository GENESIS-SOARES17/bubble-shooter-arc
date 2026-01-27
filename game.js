const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";

async function checkStatus() {
    if (!window.ethereum) return;
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const statusText = document.getElementById('status');
    const btn = document.getElementById('connect-button');

    if (accounts.length > 0 && chainId === ARC_CHAIN_ID) {
        statusText.innerText = "STATUS: CONNECTED (" + accounts[0].substring(0,6) + ")";
        statusText.style.color = "#00ff88";
        btn.innerText = "WALLET ACTIVE";
        btn.style.display = "none"; // Hide button if connected
    } else if (accounts.length > 0 && chainId !== ARC_CHAIN_ID) {
        statusText.innerText = "STATUS: WRONG NETWORK (CLICK TO FIX)";
        statusText.style.color = "#ffcc00";
    }
}

async function startConnection() {
    if (window.ethereum) {
        try {
            // Force account request
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Force network switch
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
            // THE TRICK: Force the browser to refresh everything
            setTimeout(() => { window.location.reload(); }, 500);
        } catch (e) {
            console.error(e);
        }
    }
}

document.getElementById('connect-button').onclick = startConnection;
window.onload = checkStatus;

// Render Arcade Game (image_301cda.png)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const colors = ['#00BFFF', '#FF1493', '#32CD32', '#FFD700', '#FF4500'];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<5; i++) {
        for(let j=0; j<8; j++) {
            ctx.beginPath();
            ctx.arc(40 + j*52, 50 + i*45, 19, 0, Math.PI*2);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
        }
    }
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height-50, 24, 0, Math.PI*2);
    ctx.fillStyle = "yellow";
    ctx.fill();
}
setInterval(draw, 50);