/**
 * Funcionalidad para la sección de análisis de comportamiento del cliente
 */
class CustomerAnalysis {
    /**
     * Inicializa el análisis de clientes
     */
    constructor() {
        this.pageId = 'customer-page';
        this.page = document.getElementById(this.pageId);
        this.initialized = false;
    
        // Verifica si existe el botón antes de agregar el evento
        const btn = document.querySelector(`[data-page="customer"]`);
        if (btn) {
            btn.addEventListener('click', () => this.showPage());
        }
    }
    
    showPage() {
        if (!this.page) return;
    
        // Ocultar todas las páginas
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    
        // Mostrar la correcta
        this.page.classList.add("active");
    
        // Inicializar solo una vez
        if (!this.initialized) {
            this.initPage();
            this.initialized = true;
        }
    
        this.loadData();
    }
    /**
     * Inicializa la estructura de la página
     */
    initPage() {
        this.page.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Abandono de Carrito</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="metric-card">
                                        <h6>Tasa de Abandono</h6>
                                        <p class="metric-value" id="cart-abandonment-rate">0%</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="metric-card">
                                        <h6>Tiempo Promedio</h6>
                                        <p class="metric-value" id="cart-abandonment-time">0 min</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4">
                                <div id="cart-abandonment-chart" class="chart-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Productos Más Abandonados</h5>
                        </div>
                        <div class="card-body">
                            <div id="abandoned-products-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Distribución de Compras</h5>
                            <div class="card-tools">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-outline-secondary active" data-demographic="age">Edad</button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" data-demographic="gender">Género</button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" data-demographic="location">Ubicación</button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="demographics-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Patrones de Compra</h5>
                        </div>
                        <div class="card-body">
                            <div id="purchase-patterns-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Frecuencia de Compra</h5>
                        </div>
                        <div class="card-body">
                            <div id="purchase-frequency-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar event listeners para los botones demográficos
        const demographicButtons = this.page.querySelectorAll('[data-demographic]');
        demographicButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                demographicButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.loadDemographicsData(e.target.dataset.demographic);
            });
        });
    }
    
    /**
     * Carga todos los datos para la página de análisis de clientes
     */
    loadData() {
        this.loadCartAbandonmentData();
        this.loadAbandonedProductsData();
        this.loadDemographicsData('age'); // Cargar demografía por edad por defecto
        this.loadPurchasePatternsData();
        this.loadPurchaseFrequencyData();
    }
    
    /**
     * Carga datos de abandono de carrito
     */
    loadCartAbandonmentData() {
        fetch('/api/customer/cart_abandonment')
            .then(response => response.json())
            .then(data => {
                // Actualizar métricas
                document.getElementById('cart-abandonment-rate').textContent = data.rate.toFixed(2) + '%';
                document.getElementById('cart-abandonment-time').textContent = data.avg_time.toFixed(2) + ' min';
                
                // Renderizar gráfico
                this.renderCartAbandonmentChart(data.timeline);
            })
            .catch(error => {
                console.error('Error al cargar datos de abandono de carrito:', error);
                this.loadDummyCartAbandonmentData();
            });
    }
    
    /**
     * Carga datos de productos abandonados
     */
    loadAbandonedProductsData() {
        fetch('/api/customer/cart_abandonment')
            .then(response => response.json())
            .then(data => {
                if (data.top_abandoned_products) {
                    this.renderAbandonedProductsChart(data.top_abandoned_products);
                }
            })
            .catch(error => {
                console.error('Error al cargar productos abandonados:', error);
                this.loadDummyAbandonedProductsData();
            });
    }
    
    /**
     * Carga datos demográficos
     */
    loadDemographicsData(type = 'age') {
        fetch('/api/customer/demographics')
            .then(response => response.json())
            .then(data => {
                if (data[type]) {
                    this.renderDemographicsChart(data[type], type);
                }
            })
            .catch(error => {
                console.error('Error al cargar datos demográficos:', error);
                this.loadDummyDemographicsData(type);
            });
    }
    
    /**
     * Carga datos de patrones de compra
     */
    loadPurchasePatternsData() {
        fetch('/api/customer/purchase_patterns')
            .then(response => response.json())
            .then(data => {
                if (data.related_products) {
                    this.renderPurchasePatternsChart(data.related_products);
                }
            })
            .catch(error => {
                console.error('Error al cargar patrones de compra:', error);
                this.loadDummyPurchasePatternsData();
            });
    }
    
    /**
     * Carga datos de frecuencia de compra
     */
    loadPurchaseFrequencyData() {
        fetch('/api/customer/purchase_patterns')
            .then(response => response.json())
            .then(data => {
                if (data.frequency) {
                    this.renderPurchaseFrequencyChart(data.frequency);
                }
            })
            .catch(error => {
                console.error('Error al cargar frecuencia de compra:', error);
                this.loadDummyPurchaseFrequencyData();
            });
    }
    
    /**
     * Renderiza el gráfico de abandono de carrito
     */
    renderCartAbandonmentChart(data) {
        const chartElement = document.getElementById('cart-abandonment-chart');
        if (!chartElement) return;
        
        const options = {
            chart: {
                type: 'line',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            series: [{
                name: 'Tasa de Abandono',
                data: data.rates || []
            }],
            xaxis: {
                categories: data.dates || []
            },
            colors: ['#e74a3b']
        };
        
        if (this.cartAbandonmentChartInstance) {
            this.cartAbandonmentChartInstance.updateOptions(options);
        } else {
            this.cartAbandonmentChartInstance = new ApexCharts(chartElement, options);
            this.cartAbandonmentChartInstance.render();
        }
    }
    
    /**
     * Renderiza el gráfico de productos abandonados
     */
    renderAbandonedProductsChart(data) {
        const chartElement = document.getElementById('abandoned-products-chart');
        if (!chartElement) return;
        
        const products = data.map(item => item.product_name);
        const counts = data.map(item => item.count);
        
        const options = {
            chart: {
                type: 'bar',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true
                }
            },
            series: [{
                name: 'Abandonos',
                data: counts
            }],
            xaxis: {
                categories: products
            },
            colors: ['#f6c23e']
        };
        
        if (this.abandonedProductsChartInstance) {
            this.abandonedProductsChartInstance.updateOptions(options);
        } else {
            this.abandonedProductsChartInstance = new ApexCharts(chartElement, options);
            this.abandonedProductsChartInstance.render();
        }
    }
    
    /**
     * Renderiza el gráfico demográfico
     */
    renderDemographicsChart(data, type) {
        const chartElement = document.getElementById('demographics-chart');
        if (!chartElement) return;
        
        let chartOptions = {};
        
        if (type === 'age') {
            // Gráfico de barras para grupos de edad
            const ageGroups = data.map(item => item.group);
            const counts = data.map(item => item.count);
            
            chartOptions = {
                chart: {
                    type: 'bar',
                    height: 350
                },
                plotOptions: {
                    bar: {
                        borderRadius: 4
                    }
                },
                series: [{
                    name: 'Clientes',
                    data: counts
                }],
                xaxis: {
                    categories: ageGroups
                },
                colors: ['#4e73df']
            };
        } else if (type === 'gender') {
            // Gráfico de pastel para género
            chartOptions = {
                chart: {
                    type: 'pie',
                    height: 350
                },
                series: data.map(item => item.count),
                labels: data.map(item => item.gender),
                colors: ['#4e73df', '#f6c23e', '#36b9cc']
            };
        } else if (type === 'location') {
            // Gráfico de barras para ubicaciones
            const locations = data.map(item => item.location);
            const counts = data.map(item => item.count);
            
            chartOptions = {
                chart: {
                    type: 'bar',
                    height: 350
                },
                plotOptions: {
                    bar: {
                        borderRadius: 4
                    }
                },
                series: [{
                    name: 'Clientes',
                    data: counts
                }],
                xaxis: {
                    categories: locations
                },
                colors: ['#1cc88a']
            };
        }
        
        if (this.demographicsChartInstance) {
            this.demographicsChartInstance.updateOptions(chartOptions);
        } else {
            this.demographicsChartInstance = new ApexCharts(chartElement, chartOptions);
            this.demographicsChartInstance.render();
        }
    }
    
    /**
     * Renderiza el gráfico de patrones de compra
     */
    renderPurchasePatternsChart(data) {
        const chartElement = document.getElementById('purchase-patterns-chart');
        if (!chartElement) return;
        
        // Adaptar datos para un gráfico de red
        const options = {
            chart: {
                type: 'radar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Frecuencia de compra conjunta',
                data: data.map(item => item.frequency)
            }],
            labels: data.map(item => item.product_pair),
            colors: ['#1cc88a']
        };
        
        if (this.purchasePatternsChartInstance) {
            this.purchasePatternsChartInstance.updateOptions(options);
        } else {
            this.purchasePatternsChartInstance = new ApexCharts(chartElement, options);
            this.purchasePatternsChartInstance.render();
        }
    }
    
    /**
     * Renderiza el gráfico de frecuencia de compra
     */
    renderPurchaseFrequencyChart(data) {
        const chartElement = document.getElementById('purchase-frequency-chart');
        if (!chartElement) return;
        
        const options = {
            chart: {
                type: 'line',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            series: [{
                name: 'Frecuencia',
                data: data.counts || []
            }],
            xaxis: {
                categories: data.periods || []
            },
            colors: ['#36b9cc']
        };
        
        if (this.purchaseFrequencyChartInstance) {
            this.purchaseFrequencyChartInstance.updateOptions(options);
        } else {
            this.purchaseFrequencyChartInstance = new ApexCharts(chartElement, options);
            this.purchaseFrequencyChartInstance.render();
        }
    }
    
    /**
     * Carga datos dummy para abandono de carrito cuando hay errores
     */
    loadDummyCartAbandonmentData() {
        document.getElementById('cart-abandonment-rate').textContent = '67.8%';
        document.getElementById('cart-abandonment-time').textContent = '12.5 min';
        
        const dummyData = {
            dates: ['01/02', '02/02', '03/02', '04/02', '05/02', '06/02', '07/02'],
            rates: [65.2, 68.7, 64.3, 67.5, 70.1, 66.8, 67.8]
        };
        
        this.renderCartAbandonmentChart({timeline: dummyData});
    }
    
    /**
     * Carga datos dummy para productos abandonados cuando hay errores
     */
    loadDummyAbandonedProductsData() {
        const dummyData = [
            {product_name: 'Smartphone XYZ', count: 156},
            {product_name: 'Auriculares Wireless', count: 127},
            {product_name: 'Tablet Ultra', count: 98},
            {product_name: 'Smartwatch Pro', count: 87},
            {product_name: 'Laptop Gaming', count: 76}
        ];
        
        this.renderAbandonedProductsChart(dummyData);
    }
    
    /**
     * Carga datos dummy para demografía cuando hay errores
     */
    loadDummyDemographicsData(type) {
        let dummyData = [];
        
        if (type === 'age') {
            dummyData = [
                {group: '18-24', count: 246},
                {group: '25-34', count: 385},
                {group: '35-44', count: 327},
                {group: '45-54', count: 173},
                {group: '55-64', count: 98},
                {group: '65+', count: 42}
            ];
        } else if (type === 'gender') {
            dummyData = [
                {gender: 'Masculino', count: 560},
                {gender: 'Femenino', count: 632},
                {gender: 'Otro', count: 79}
            ];
        } else if (type === 'location') {
            dummyData = [
                {location: 'Madrid', count: 245},
                {location: 'Barcelona', count: 217},
                {location: 'Valencia', count: 178},
                {location: 'Sevilla', count: 142},
                {location: 'Bilbao', count: 126},
                {location: 'Otros', count: 363}
            ];
        }
        
        this.renderDemographicsChart(dummyData, type);
    }
    
    /**
     * Carga datos dummy para patrones de compra cuando hay errores
     */
    loadDummyPurchasePatternsData() {
        const dummyData = [
            {product_pair: 'Smartphone + Funda', frequency: 87},
            {product_pair: 'Laptop + Mouse', frequency: 73},
            {product_pair: 'Cámara + SD Card', frequency: 65},
            {product_pair: 'Tablet + Teclado', frequency: 58},
            {product_pair: 'TV + Soundbar', frequency: 52},
            {product_pair: 'Consola + Juego', frequency: 48}
        ];
        
        this.renderPurchasePatternsChart({related_products: dummyData});
    }
    
    /**
     * Carga datos dummy para frecuencia de compra cuando hay errores
     */
    loadDummyPurchaseFrequencyData() {
        const dummyData = {
            periods: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            counts: [32, 45, 38, 41, 53, 68, 49]
        };
        
        this.renderPurchaseFrequencyChart({frequency: dummyData});
    }
}

// Inicializar la clase cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // La instancia se crea pero la página solo se inicializa cuando se navega a ella
    window.customerAnalysis = new CustomerAnalysis();
});