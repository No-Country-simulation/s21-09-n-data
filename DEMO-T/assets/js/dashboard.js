/**
 * Funcionalidad para el dashboard principal
 */
class Dashboard {
    /**
     * Inicializa el dashboard
     */
    constructor() {
        this.initElements();
        this.setupEventListeners();
        this.loadData();
    }

    /**
     * Inicializa los elementos del DOM
     */
    initElements() {
        // Elementos para las métricas
        this.totalSalesElement = document.getElementById('total-sales');
        this.conversionRateElement = document.getElementById('conversion-rate');
        this.totalRevenueElement = document.getElementById('total-revenue');
        this.availableStockElement = document.getElementById('available-stock');
        
        // Elementos de filtro
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');
        this.applyFilterBtn = document.getElementById('apply-date-filter');
        
        // Elementos para gráficos
        this.salesTrendChart = document.getElementById('sales-trend-chart');
        this.topProductsChart = document.getElementById('top-products-chart');
        this.locationHeatmap = document.getElementById('location-heatmap');
        this.recentActivityList = document.getElementById('recent-activity');
        
        // Botones de intervalo
        this.intervalButtons = document.querySelectorAll('[data-interval]');
        
        // Inicializar fechas predeterminadas
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        this.startDateInput.value = this.formatDate(thirtyDaysAgo);
        this.endDateInput.value = this.formatDate(today);
        
        this.currentInterval = 'day';
    }

    /**
     * Configura los listeners de eventos
     */
    setupEventListeners() {
        this.applyFilterBtn.addEventListener('click', () => this.loadData());
        
        // Configurar botones de intervalo
        this.intervalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.intervalButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentInterval = e.target.dataset.interval;
                this.loadSalesTrendData();
            });
        });
    }

    /**
     * Carga todos los datos del dashboard
     */
    loadData() {
        this.loadSummaryData();
        this.loadSalesTrendData();
        this.loadTopProductsData();
        this.loadLocationHeatmapData();
        this.loadRecentActivity();
    }

    /**
     * Carga los datos de resumen del dashboard
     */
    loadSummaryData() {
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        
        fetch(`/api/dashboard/summary?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.json())
            .then(data => {
                this.updateSummaryMetrics(data);
            })
            .catch(error => {
                console.error('Error al cargar datos de resumen:', error);
                // Cargar datos de ejemplo para desarrollo
                this.loadDummySummaryData();
            });
    }

    /**
     * Carga datos de tendencia de ventas
     */
    loadSalesTrendData() {
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        
        fetch(`/api/dashboard/sales_trends?start_date=${startDate}&end_date=${endDate}&interval=${this.currentInterval}`)
            .then(response => response.json())
            .then(data => {
                this.renderSalesTrendChart(data);
            })
            .catch(error => {
                console.error('Error al cargar tendencias de ventas:', error);
                // Cargar datos de ejemplo para desarrollo
                this.loadDummySalesTrendData();
            });
    }

    /**
     * Carga datos de productos más vendidos
     */
    loadTopProductsData() {
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        
        // Obtener los datos del endpoint o usar datos de prueba
        fetch(`/api/dashboard/summary?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.json())
            .then(data => {
                if (data.top_products) {
                    this.renderTopProductsChart(data.top_products);
                }
            })
            .catch(error => {
                console.error('Error al cargar productos top:', error);
                // Cargar datos de ejemplo para desarrollo
                this.loadDummyTopProductsData();
            });
    }

    /**
     * Carga datos de mapa de calor por ubicación
     */
    loadLocationHeatmapData() {
        fetch('/api/dashboard/location_heatmap')
            .then(response => response.json())
            .then(data => {
                this.renderLocationHeatmap(data);
            })
            .catch(error => {
                console.error('Error al cargar datos de mapa de calor:', error);
                // Cargar datos de ejemplo para desarrollo
                this.loadDummyLocationData();
            });
    }

    /**
     * Carga actividad reciente
     */
    loadRecentActivity() {
        // En un entorno real, esto cargaría desde una API
        // Aquí usamos datos de ejemplo directamente
        const activities = [
            {
                type: 'sale',
                icon: 'shopping-cart',
                text: 'Nueva venta: <strong>Smartphone XYZ</strong>',
                time: 'Hace 5 minutos'
            },
            {
                type: 'user',
                icon: 'user',
                text: 'Nuevo cliente registrado: <strong>María López</strong>',
                time: 'Hace 15 minutos'
            },
            {
                type: 'review',
                icon: 'star',
                text: 'Nueva reseña: <strong>Tablet ABC (5 estrellas)</strong>',
                time: 'Hace 32 minutos'
            },
            {
                type: 'alert',
                icon: 'exclamation-triangle',
                text: 'Alerta de stock bajo: <strong>Auriculares QWE</strong>',
                time: 'Hace 45 minutos'
            }
        ];
        
        this.renderRecentActivity(activities);
    }

    /**
     * Actualiza las métricas de resumen
     */
    updateSummaryMetrics(data) {
        this.totalSalesElement.textContent = data.total_sales.toLocaleString();
        this.conversionRateElement.textContent = data.conversion_rate.toFixed(2) + '%';
        this.totalRevenueElement.textContent = '$' + data.total_revenue.toLocaleString();
        this.availableStockElement.textContent = data.available_stock.toLocaleString();
    }

    /**
     * Renderiza el gráfico de tendencia de ventas
     */
    renderSalesTrendChart(data) {
        if (!data || !data.dates || !data.values) {
            console.error('Datos de tendencia de ventas inválidos');
            return;
        }
        
        const options = {
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            series: [{
                name: 'Ventas',
                data: data.values
            }],
            xaxis: {
                categories: data.dates,
                labels: {
                    formatter: function(value) {
                        return value;
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Ventas'
                }
            },
            colors: ['#4e73df'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 90, 100]
                }
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy HH:mm'
                },
            }
        };
        
        if (this.salesTrendChartInstance) {
            this.salesTrendChartInstance.updateOptions(options);
        } else {
            this.salesTrendChartInstance = new ApexCharts(this.salesTrendChart, options);
            this.salesTrendChartInstance.render();
        }
    }

    /**
     * Renderiza el gráfico de productos más vendidos
     */
    renderTopProductsChart(topProducts) {
        const products = topProducts.map(product => product.name);
        const quantities = topProducts.map(product => product.quantity);
        
        const options = {
            chart: {
                type: 'bar',
                height: 350,
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
            dataLabels: {
                enabled: false
            },
            series: [{
                name: 'Unidades vendidas',
                data: quantities
            }],
            xaxis: {
                categories: products
            },
            colors: ['#36b9cc']
        };
        
        if (this.topProductsChartInstance) {
            this.topProductsChartInstance.updateOptions(options);
        } else {
            this.topProductsChartInstance = new ApexCharts(this.topProductsChart, options);
            this.topProductsChartInstance.render();
        }
    }

    /**
     * Renderiza el mapa de calor de ubicaciones
     */
    renderLocationHeatmap(data) {
        // Simplificar usando un mapa básico para demostración
        // En una implementación real, esto usaría una librería de mapas geográficos
        
        if (!this.heatmapInstance) {
            // Configurar el contenedor para el heatmap
            this.locationHeatmap.innerHTML = '';
            this.locationHeatmap.style.height = '350px';
            this.locationHeatmap.style.position = 'relative';
            
            this.heatmapInstance = h337.create({
                container: this.locationHeatmap,
                radius: 20,
                maxOpacity: .8,
                minOpacity: 0,
                blur: .8
            });
        }
        
        // Convertir los datos geográficos a formato de mapa de calor
        const points = [];
        const containerWidth = this.locationHeatmap.offsetWidth;
        const containerHeight = this.locationHeatmap.offsetHeight;
        
        // Datos de ejemplo si no hay datos reales
        if (!data || !data.locations) {
            data = this.getDummyLocationData();
        }
        
        data.locations.forEach(location => {
            // Convertir coordenadas geográficas a coordenadas del contenedor
            points.push({
                x: Math.floor(containerWidth * (location.x / 100)),
                y: Math.floor(containerHeight * (location.y / 100)),
                value: location.value
            });
        });
        
        this.heatmapInstance.setData({
            max: 100,
            data: points
        });
    }

    /**
     * Renderiza la actividad reciente
     */
    renderRecentActivity(activities) {
        this.recentActivityList.innerHTML = '';
        
        activities.forEach(activity => {
            const item = document.createElement('li');
            item.className = 'activity-item';
            
            item.innerHTML = `
                <div class="activity-icon"><i class="fas fa-${activity.icon}"></i></div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <p class="activity-time">${activity.time}</p>
                </div>
            `;
            
            this.recentActivityList.appendChild(item);
        });
    }

    /**
     * Carga datos de resumen de ejemplo (para desarrollo)
     */
    loadDummySummaryData() {
        const dummyData = {
            total_sales: 1258,
            conversion_rate: 3.45,
            total_revenue: 157895.50,
            available_stock: 5642
        };
        
        this.updateSummaryMetrics(dummyData);
    }

    /**
     * Carga datos de tendencia de ventas de ejemplo (para desarrollo)
     */
    loadDummySalesTrendData() {
        // Generar fechas de los últimos 30 días
        const dates = [];
        const values = [];
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(this.formatShortDate(date));
            
            // Generar valor aleatorio entre 10 y 100
            values.push(Math.floor(Math.random() * 90) + 10);
        }
        
        this.renderSalesTrendChart({dates, values});
    }

    /**
     * Carga datos de productos más vendidos de ejemplo (para desarrollo)
     */
    loadDummyTopProductsData() {
        const topProducts = [
            {name: 'Smartphone XYZ', quantity: 125},
            {name: 'Auriculares ABC', quantity: 98},
            {name: 'Laptop Pro', quantity: 76},
            {name: 'Smartwatch Y23', quantity: 62},
            {name: 'Tablet Ultra', quantity: 45}
        ];
        
        this.renderTopProductsChart(topProducts);
    }

    /**
     * Carga datos de ubicación de ejemplo (para desarrollo)
     */
    loadDummyLocationData() {
        const data = this.getDummyLocationData();
        this.renderLocationHeatmap(data);
    }

    /**
     * Obtiene datos de ubicación de ejemplo
     */
    getDummyLocationData() {
        const locations = [];
        
        // Generar 50 puntos aleatorios
        for (let i = 0; i < 50; i++) {
            locations.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                value: Math.floor(Math.random() * 100)
            });
        }
        
        return {
            locations: locations
        };
    }

    /**
     * Formatea una fecha como YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    /**
     * Formatea una fecha como DD/MM
     */
    formatShortDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${day}/${month}`;
    }
}

// Inicializar la clase cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardInstance = new Dashboard();
});