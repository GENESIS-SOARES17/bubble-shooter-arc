// cryptoTicker.js - Ticker de criptomoedas

export class CryptoTicker {
    constructor() {
        this.tickerTrack = document.getElementById("tickerTrack");
        this.updateInterval = null;
    }

    async init() {
        await this.fetchTopCryptos();
        this.updateInterval = setInterval(() => this.fetchTopCryptos(), 60000); // Atualiza a cada minuto
    }

    async fetchTopCryptos() {
        try {
            const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false");
            const data = await res.json();
            
            let tickerHTML = '';
            data.forEach(crypto => {
                const symbol = crypto.symbol.toUpperCase();
                const price = crypto.current_price < 1 ? crypto.current_price.toFixed(6) : crypto.current_price.toFixed(2);
                const change = crypto.price_change_percentage_24h;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                const changeSign = change >= 0 ? '+' : '';
                const changeFormatted = `${changeSign}${change.toFixed(2)}%`;
                
                tickerHTML += `
                    <span class="crypto-ticker-item">
                        <span class="symbol">${symbol}</span>
                        <span class="price">$${price}</span>
                        <span class="change ${changeClass}">${changeFormatted}</span>
                    </span> • `;
            });
            
            if (this.tickerTrack) {
                this.tickerTrack.innerHTML = tickerHTML;
            }
        } catch(e) { 
            console.error("Erro ao carregar criptomoedas:", e);
            this.showFallbackData();
        }
    }

    showFallbackData() {
        const fallbackCryptos = [
            {symbol: 'BTC', price: '45,231.50', change: '+2.34'},
            {symbol: 'ETH', price: '3,128.75', change: '+1.89'},
            {symbol: 'BNB', price: '587.20', change: '-0.45'},
            {symbol: 'SOL', price: '102.30', change: '+5.67'},
            {symbol: 'XRP', price: '0.6234', change: '+0.89'},
            {symbol: 'ADA', price: '0.4589', change: '-1.23'},
            {symbol: 'AVAX', price: '35.67', change: '+3.45'},
            {symbol: 'DOT', price: '7.89', change: '+0.67'},
            {symbol: 'DOGE', price: '0.1589', change: '+2.34'},
            {symbol: 'MATIC', price: '0.9567', change: '-0.89'},
            {symbol: 'SHIB', price: '0.000025', change: '+1.23'},
            {symbol: 'TRX', price: '0.1045', change: '+0.45'},
            {symbol: 'LTC', price: '68.90', change: '-0.34'},
            {symbol: 'UNI', price: '6.78', change: '+1.56'},
            {symbol: 'ATOM', price: '9.45', change: '+0.89'},
            {symbol: 'LINK', price: '14.23', change: '+2.12'},
            {symbol: 'XLM', price: '0.1234', change: '+0.34'},
            {symbol: 'ETC', price: '26.78', change: '-1.23'},
            {symbol: 'ALGO', price: '0.1890', change: '+0.67'},
            {symbol: 'VET', price: '0.0345', change: '+1.89'}
        ];
        
        let fallbackHTML = '';
        fallbackCryptos.forEach(crypto => {
            fallbackHTML += `
                <span class="crypto-ticker-item">
                    <span class="symbol">${crypto.symbol}</span>
                    <span class="price">$${crypto.price}</span>
                    <span class="change ${crypto.change.startsWith('+') ? 'positive' : 'negative'}">${crypto.change}%</span>
                </span> • `;
        });
        
        if (this.tickerTrack) {
            this.tickerTrack.innerHTML = fallbackHTML;
        }
    }
}