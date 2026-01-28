// web3Integration.js - Módulo de integração Web3

export class Web3Integration {
    constructor(app) {
        this.app = app;
        this.provider = null;
        this.signer = null;
        
        this.ARC_CHAIN = {
            chainId: "0x4CF7D2",
            chainName: "ARC Testnet",
            rpcUrls: ["https://rpc.testnet.arc.network"],
            nativeCurrency: { 
                name: "ARC", 
                symbol: "ARC", 
                decimals: 18 
            },
            blockExplorerUrls: ["https://testnet.arc.network"]
        };
    }

    async connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            this.app.modules.ui.showNotification("MetaMask não encontrada! Instale a extensão.", "error");
            return;
        }
        
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (!accounts || accounts.length === 0) {
                this.app.modules.ui.showNotification("Nenhuma conta conectada.", "error");
                return;
            }
            
            const account = accounts[0];
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            this.app.updateState({ account });
            this.app.modules.ui.updateWalletUI(account, true);
            
            this.app.modules.ui.showNotification(`Conectado: ${account.slice(0,6)}...${account.slice(-4)}`, "success");
            
            // Configurar listeners da MetaMask
            this.setupMetaMaskListeners();
            
        } catch (error) {
            this.handleWalletError(error);
        }
    }

    setupMetaMaskListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.app.modules.ui.showNotification("Carteira desconectada.", "error");
                    this.app.updateState({ 
                        account: null,
                        signed: false 
                    });
                    this.app.modules.ui.updateWalletUI(null, false);
                } else {
                    const account = accounts[0];
                    this.app.updateState({ account });
                    this.app.modules.ui.updateUI();
                    this.app.modules.ui.showNotification("Conta alterada!", "info");
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    async signTerms() {
        const state = this.app.getState();
        if (!this.signer || !state.account) {
            this.app.modules.ui.showNotification("Conecte uma carteira primeiro!", "error");
            return;
        }

        try {
            const message = `ARC Bubble Shooter Authentication\n\nData: ${new Date().toISOString()}\nConta: ${state.account}`;
            const signature = await this.signer.signMessage(message);
            
            if (signature) {
                this.app.updateState({ signed: true });
                this.app.modules.ui.updateSignUI(true);
                this.app.modules.ui.showNotification("Assinatura confirmada! Pronto para jogar.", "success");
            }
        } catch (error) {
            this.handleSignError(error);
        }
    }

    handleWalletError(error) {
        if (error.code === 4001) {
            this.app.modules.ui.showNotification("Conexão rejeitada pelo usuário.", "error");
        } else if (error.code === -32002) {
            this.app.modules.ui.showNotification("Conexão pendente. Verifique sua MetaMask.", "error");
        } else {
            this.app.modules.ui.showNotification(`Erro: ${error.message}`, "error");
        }
    }

    handleSignError(error) {
        if (error.code === 4001) {
            this.app.modules.ui.showNotification("Assinatura cancelada pelo usuário.", "error");
        } else {
            this.app.modules.ui.showNotification("Erro na assinatura. Tente novamente.", "error");
        }
    }

    async switchToArcNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.ARC_CHAIN.chainId }],
            });
            return true;
        } catch (error) {
            if (error.code === 4902) {
                return await this.addArcNetwork();
            }
            return false;
        }
    }

    async addArcNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [this.ARC_CHAIN],
            });
            return true;
        } catch (error) {
            this.app.modules.ui.showNotification("Falha ao adicionar rede ARC.", "error");
            return false;
        }
    }
}