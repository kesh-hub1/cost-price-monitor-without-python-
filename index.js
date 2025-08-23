class StockPriceMonitor {
            constructor() {
                this.isRunning = false;
                this.stocks = new Map();
                this.alerts = [];
                this.priceHistory = new Map();
                this.updateInterval = null;
                
                // Sample stock symbols for demo
                this.sampleStocks = [
                    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175 },
                    { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 2800 },
                    { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 380 },
                    { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 250 },
                    { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 145 },
                    { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 320 },
                    { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 450 },
                    { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 480 }
                ];
                
                this.initializeElements();
                this.setupChart();
                this.setupEventListeners();
                this.addDefaultStocks();
            }
            
            initializeElements() {
                this.stockInput = document.getElementById('stockInput');
                this.addStockBtn = document.getElementById('addStockBtn');
                this.startBtn = document.getElementById('startBtn');
                this.stopBtn = document.getElementById('stopBtn');
                this.statusIndicator = document.getElementById('statusIndicator');
                this.statusText = document.getElementById('statusText');
                this.stocksGrid = document.getElementById('stocksGrid');
                this.alertsContainer = document.getElementById('alertsContainer');
                this.clearAlertsBtn = document.getElementById('clearAlertsBtn');
                this.notification = document.getElementById('notification');
                
                // Market summary elements
                this.totalStocksEl = document.getElementById('totalStocks');
                this.avgChangeEl = document.getElementById('avgChange');
                this.gainersCountEl = document.getElementById('gainersCount');
                this.losersCountEl = document.getElementById('losersCount');
            }
            
            setupChart() {
                const ctx = document.getElementById('priceChart').getContext('2d');
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: []
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Time'
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Price ($)'
                                }
                            }
                        }
                    }
                });
            }
            
            setupEventListeners() {
                this.addStockBtn.addEventListener('click', () => this.addStock());
                this.stockInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addStock();
                });
                this.startBtn.addEventListener('click', () => this.startMonitoring());
                this.stopBtn.addEventListener('click', () => this.stopMonitoring());
                this.clearAlertsBtn.addEventListener('click', () => this.clearAlerts());
                
                // Chart period buttons
                document.querySelectorAll('.chart-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.updateChart();
                    });
                });
            }
            
            addDefaultStocks() {
                // Add some default stocks for demo
                const defaultStocks = ['AAPL', 'GOOGL', 'TSLA'];
                defaultStocks.forEach(symbol => {
                    this.addStockToPortfolio(symbol);
                });
                this.renderStocks();
            }
            
            addStock() {
                const symbol = this.stockInput.value.toUpperCase().trim();
                if (!symbol) return;
                
                if (this.stocks.has(symbol)) {
                    this.showNotification('Stock already added!', 'warning');
                    return;
                }
                
                this.addStockToPortfolio(symbol);
                this.stockInput.value = '';
                this.renderStocks();
                this.updateChart();
                this.showNotification(`${symbol} added successfully!`, 'success');
            }
            
            addStockToPortfolio(symbol) {
                const stockInfo = this.sampleStocks.find(s => s.symbol === symbol) || {
                    symbol,
                    name: `${symbol} Corp.`,
                    basePrice: Math.random() * 500 + 50
                };
                
                const stock = {
                    symbol: stockInfo.symbol,
                    name: stockInfo.name,
                    price: stockInfo.basePrice,
                    previousPrice: stockInfo.basePrice,
                    change: 0,
                    changePercent: 0,
                    high24h: stockInfo.basePrice,
                    low24h: stockInfo.basePrice,
                    volume: Math.floor(Math.random() * 1000000) + 100000,
                    lastUpdate: new Date()
                };
                
                this.stocks.set(symbol, stock);
                this.priceHistory.set(symbol, [stockInfo.basePrice]);
            }
            
            startMonitoring() {
                this.isRunning = true;
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.statusIndicator.className = 'status-indicator status-running';
                this.statusText.textContent = 'Running';
                
                this.updateInterval = setInterval(() => this.updatePrices(), 2000);
                this.showNotification('Monitoring started!', 'success');
            }
            
            stopMonitoring() {
                this.isRunning = false;
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                this.statusIndicator.className = 'status-indicator status-stopped';
                this.statusText.textContent = 'Stopped';
                
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                }
                this.showNotification('Monitoring stopped!', 'info');
            }
            
            updatePrices() {
                this.stocks.forEach((stock, symbol) => {
                    // Simulate realistic price movement
                    const volatility = 0.02; // 2% volatility
                    const randomChange = (Math.random() - 0.5) * 2 * volatility;
                    const newPrice = stock.price * (1 + randomChange);
                    
                    stock.previousPrice = stock.price;
                    stock.price = Math.max(newPrice, 0.01); // Prevent negative prices
                    stock.change = stock.price - stock.previousPrice;
                    stock.changePercent = (stock.change / stock.previousPrice) * 100;
                    stock.lastUpdate = new Date();
                    
                    // Update 24h high/low
                    stock.high24h = Math.max(stock.high24h, stock.price);
                    stock.low24h = Math.min(stock.low24h, stock.price);
                    
                    // Update volume
                    stock.volume += Math.floor(Math.random() * 10000);
                    
                    // Update price history
                    const history = this.priceHistory.get(symbol);
                    history.push(stock.price);
                    if (history.length > 100) history.shift(); // Keep last 100 points
                    
                    // Check for alerts
                    this.checkPriceAlerts(stock);
                });
                
                this.renderStocks();
                this.updateMarketSummary();
                this.updateChart();
            }
            
            checkPriceAlerts(stock) {
                const changePercent = Math.abs(stock.changePercent);
                
                // Alert for significant price movements
                if (changePercent > 5) {
                    const alertType = stock.changePercent > 0 ? 'success' : 'danger';
                    const direction = stock.changePercent > 0 ? 'surged' : 'dropped';
                    this.addAlert(
                        `${stock.symbol} has ${direction} by ${changePercent.toFixed(2)}%`,
                        alertType
                    );
                }
                
                // Alert for extreme price movements
                if (changePercent > 10) {
                    this.addAlert(
                        `⚠️ EXTREME: ${stock.symbol} moved ${changePercent.toFixed(2)}%`,
                        'danger'
                    );
                }
            }
            
            addAlert(message, type) {
                const alert = {
                    id: Date.now(),
                    message,
                    type,
                    timestamp: new Date()
                };
                
                this.alerts.unshift(alert);
                if (this.alerts.length > 20) this.alerts.pop(); // Keep last 20 alerts
                
                this.renderAlerts();
                this.showNotification(message, type);
            }
            
            renderStocks() {
                if (this.stocks.size === 0) {
                    this.stocksGrid.innerHTML = '<div class="loading">Add some stocks to get started...</div>';
                    return;
                }
                
                const stocksHTML = Array.from(this.stocks.values()).map(stock => {
                    const changeClass = stock.change > 0 ? 'positive' : stock.change < 0 ? 'negative' : 'neutral';
                    const changeIcon = stock.change > 0 ? '↗️' : stock.change < 0 ? '↘️' : '➡️';
                    
                    return `
                        <div class="stock-card ${changeClass}">
                            <div class="stock-header">
                                <div>
                                    <div class="stock-symbol">${stock.symbol}</div>
                                    <div style="font-size: 0.9rem; color: #6c757d;">${stock.name}</div>
                                </div>
                                <button class="btn" style="padding: 8px 12px; font-size: 0.8rem; background: #dc3545;" 
                                        onclick="stockMonitor.removeStock('${stock.symbol}')">Remove</button>
                            </div>
                            <div class="stock-price">$${stock.price.toFixed(2)}</div>
                            <div class="price-change ${changeClass}">
                                <span>${changeIcon}</span>
                                <span>$${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)</span>
                            </div>
                            <div class="stock-stats">
                                <div class="stat-item">
                                    <div class="stat-value">$${stock.high24h.toFixed(2)}</div>
                                    <div class="stat-label">24h High</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">$${stock.low24h.toFixed(2)}</div>
                                    <div class="stat-label">24h Low</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${(stock.volume / 1000).toFixed(0)}K</div>
                                    <div class="stat-label">Volume</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${stock.lastUpdate.toLocaleTimeString()}</div>
                                    <div class="stat-label">Updated</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                this.stocksGrid.innerHTML = stocksHTML;
            }
            
            removeStock(symbol) {
                this.stocks.delete(symbol);
                this.priceHistory.delete(symbol);
                this.renderStocks();
                this.updateChart();
                this.updateMarketSummary();
                this.showNotification(`${symbol} removed from portfolio`, 'info');
            }
            
            updateMarketSummary() {
                const stocksArray = Array.from(this.stocks.values());
                
                this.totalStocksEl.textContent = stocksArray.length;
                
                if (stocksArray.length === 0) {
                    this.avgChangeEl.textContent = '0.00%';
                    this.gainersCountEl.textContent = '0';
                    this.losersCountEl.textContent = '0';
                    return;
                }
                
                const avgChange = stocksArray.reduce((sum, stock) => sum + stock.changePercent, 0) / stocksArray.length;
                this.avgChangeEl.textContent = (avgChange >= 0 ? '+' : '') + avgChange.toFixed(2) + '%';
                this.avgChangeEl.style.color = avgChange >= 0 ? '#00c851' : '#ff4444';
                
                const gainers = stocksArray.filter(stock => stock.changePercent > 0).length;
                const losers = stocksArray.filter(stock => stock.changePercent < 0).length;
                
                this.gainersCountEl.textContent = gainers;
                this.losersCountEl.textContent = losers;
            }
            
            updateChart() {
                if (this.stocks.size === 0) return;
                
                const colors = [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                ];
                
                const datasets = [];
                let colorIndex = 0;
                
                this.stocks.forEach((stock, symbol) => {
                    const history = this.priceHistory.get(symbol);
                    const color = colors[colorIndex % colors.length];
                    
                    datasets.push({
                        label: symbol,
                        data: history,
                        borderColor: color,
                        backgroundColor: color + '20',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    });
                    
                    colorIndex++;
                });
                
                // Create time labels
                const maxLength = Math.max(...Array.from(this.priceHistory.values()).map(h => h.length));
                const labels = Array.from({length: maxLength}, (_, i) => {
                    const now = new Date();
                    const time = new Date(now - (maxLength - i - 1) * 2000); // 2 second intervals
                    return time.toLocaleTimeString();
                });
                
                this.chart.data.labels = labels;
                this.chart.data.datasets = datasets;
                this.chart.update('none');
            }
            
            renderAlerts() {
                if (this.alerts.length === 0) {
                    this.alertsContainer.innerHTML = '<div class="loading">No alerts yet...</div>';
                    return;
                }
                
                const alertsHTML = this.alerts.map(alert => `
                    <div class="alert-item ${alert.type}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span><strong>${alert.timestamp.toLocaleTimeString()}</strong> - ${alert.message}</span>
                            <button class="btn" style="padding: 4px 8px; font-size: 0.8rem; background: #6c757d;" 
                                    onclick="stockMonitor.removeAlert(${alert.id})">×</button>
                        </div>
                    </div>
                `).join('');
                
                this.alertsContainer.innerHTML = alertsHTML;
            }
            
            removeAlert(alertId) {
                this.alerts = this.alerts.filter(alert => alert.id !== alertId);
                this.renderAlerts();
            }
            
            clearAlerts() {
                this.alerts = [];
                this.renderAlerts();
                this.showNotification('All alerts cleared', 'info');
            }
            
            showNotification(message, type = 'success') {
                const colors = {
                    success: '#28a745',
                    info: '#17a2b8',
                    warning: '#ffc107',
                    danger: '#dc3545'
                };
                
                this.notification.textContent = message;
                this.notification.style.backgroundColor = colors[type] || colors.success;
                this.notification.classList.add('show');
                
                setTimeout(() => {
                    this.notification.classList.remove('show');
                }, 3000);
            }
        }
        
        // Initialize the application
        let stockMonitor;
        document.addEventListener('DOMContentLoaded', () => {
            stockMonitor = new StockPriceMonitor();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        if (stockMonitor.isRunning) {
                            stockMonitor.stopMonitoring();
                        } else {
                            stockMonitor.startMonitoring();
                        }
                        break;
                    case 'a':
                        e.preventDefault();
                        stockMonitor.stockInput.focus();
                        break;
                }
            }
        });
        
        // Auto-save portfolio to localStorage (if available)
        setInterval(() => {
            if (typeof(Storage) !== "undefined" && stockMonitor.stocks.size > 0) {
                const portfolioData = {
                    stocks: Array.from(stockMonitor.stocks.entries()),
                    timestamp: Date.now()
                };
                try {
                    localStorage.setItem('stockPortfolio', JSON.stringify(portfolioData));
                } catch (e) {
                    // localStorage not available or full
                }
            }
        }, 30000); // Save every 30 seconds