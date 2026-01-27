const ARC_CHAIN_ID = "0x4cece6"; 
const ARC_RPC = "https://rpc.testnet.arc.network";

// This function forces the screen to show the REAL status
async function refreshWalletStatus() {
    const statusText = document.getElementById('status');
    const connectBtn = document.getElementById('connect-button');

    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (accounts.length > 0 && chainId === ARC_CHAIN_ID) {
            statusText.innerText = "STATUS: CONNECTED (" + accounts[0].substring(0, 6) + ")";
            statusText.style.color = "#00ff88"; // Green
            connectBtn.innerText = "WALLET ACTIVE";
            connectBtn.style.opacity = "0.5";
        } else if (accounts.length > 0 && chainId !== ARC_CHAIN_ID) {
            statusText.innerText = "STATUS: WRONG NETWORK (SWITCH TO ARC)";
            statusText.style.color = "#ffcc00"; // Yellow
        } else {
            statusText.innerText = "STATUS: DISCONNECTED";
            statusText.style.color = "white";
        }
    }
}

async function connect() {
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
            // WAIT 1 SECOND AND REFRESH
            setTimeout(refreshWalletStatus, 1000);
        } catch (error) {
            console.error("Connection error");
        }
    }
}

// LISTENERS: Detects every change in MetaMask automatically
if (window.ethereum) {
    window.ethereum.on('accountsChanged', refreshWalletStatus);
    window.ethereum.on('chainChanged', () => window.location.reload());
}

document.getElementById('connect-button').onclick = connect;
window.onload = refreshWalletStatus;

// --- GAME RENDER (Image reference image_301cda.png) ---
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
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.stroke();
        }
    }
    // Main Shooter Ball
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height-50, 24, 0, Math.PI*2);
    ctx.fillStyle = "yellow";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";
    ctx.fill();
}
setInterval(draw, 50);