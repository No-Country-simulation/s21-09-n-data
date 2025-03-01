/**
 * Funcionalidad para la sección de Machine Learning
 */
class MachineLearningAnalysis {
    /**
     * Inicializa el análisis de Machine Learning
     */
    constructor() {
        this.pageId = 'ml-page';
        this.page = document.getElementById(this.pageId);
        this.initialized = false;

        // Verifica si el botón de navegación existe antes de agregar el evento
        const btn = document.querySelector(`[data-page="ml"]`);
        if (btn) {
            btn.addEventListener('click', () => this.showPage());
        }
    }

    /**
     * Muestra la página y la inicializa si es necesario
     */
    showPage() {
        if (!this.page) return;

        // Ocultar todas las páginas antes de mostrar la actual
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

        // Mostrar la página correcta
        this.page.classList.add("active");

        // Inicializar solo la primera vez que se accede
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
                            <h5 class="card-title">Segmentación de Clientes</h5>
                        </div>
                        <div class="card-body">
                            <div id="customer-segments-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Predicción de Abandono de Carrito</h5>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="metric-card alert-warning">
                                        <h6>Tasa de Abandono Predicha</h6>
                                        <p class="metric-value" id="cart-abandonment-rate">0%</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="metric-card alert-success">
                                        <h6>Precisión del Modelo</h6>
                                        <p class="metric-value" id="model-accuracy">0%</p>
                                    </div>
                                </div>
                            </div>
                            <div id="abandonment-factors-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Recomendaciones Personalizadas</h5>
                            <div class="card-tools">
                                <select id="customer-selector" class="form-select form-select-sm">
                                    <option value="">Seleccionar cliente</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="recommendations-container">
                                <div class="alert alert-info">
                                    Seleccione un cliente para ver recomendaciones personalizadas
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Análisis de Sentimientos</h5>
                        </div>
                        <div class="card-body">
                            <div id="sentiment-analysis-chart" class="chart-container"></div>
                            <div class="mt-3">
                                <h6>Tendencias de Sentimiento</h6>
                                <div id="sentiment-trends-chart" class="chart-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Rendimiento de Modelos ML</h5>
                            <div class="card-tools">
                                <select id="model-selector" class="form-select form-select-sm">
                                    <option value="all">Todos los modelos</option>
                                    <option value="segment">Segmentación</option>
                                    <option value="abandonment">Abandono</option>
                                    <option value="recommendation">Recomendación</option>
                                    <option value="sentiment">Sentimiento</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="metric-card">
                                        <h6>Precisión</h6>
                                        <p class="metric-value" id="model-precision">0%</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="metric-card">
                                        <h6>Recall</h6>
                                        <p class="metric-value" id="model-recall">0%</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="metric-card">
                                        <h6>F1-Score</h6>
                                        <p class="metric-value" id="model-f1">0%</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3">
                                <div id="model-performance-chart" class="chart-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar selectores
        this.customerSelector = document.getElementById('customer-selector');
        this.modelSelector = document.getElementById('model-selector');
        
        // Añadir event listeners
        this.customerSelector.addEventListener('change', this.loadRecommendations.bind(this));
        this.modelSelector.addEventListener('change', this.updateModelPerformance.bind(this));
    }
    
    /**
     * Carga los datos de machine learning desde el servidor
     */
    loadData() {
        this.loadCustomerSegments();
        this.loadCartAbandonmentPrediction();
        this.loadSentimentAnalysis();
        this.loadCustomers();
        this.updateModelPerformance();
    }
    
    /**
     * Carga los datos de segmentación de clientes
     */
    loadCustomerSegments() {
        fetch('/api/ml/customer_segments')
            .then(response => response.json())
            .then(data => {
                this.renderCustomerSegments(data);
            })
            .catch(error => {
                console.error('Error al cargar segmentos de clientes:', error);
                // Mostrar datos de ejemplo si falla la petición
                this.renderCustomerSegments(this.getSampleSegmentData());
            });
    }
    
    /**
     * Renderiza el gráfico de segmentación de clientes
     */
    renderCustomerSegments(data) {
        const chartOptions = {
            series: [{
                name: 'Clientes',
                data: data.map(segment => segment.count)
            }],
            chart: {
                type: 'pie',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            labels: data.map(segment => segment.name),
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            colors: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
            tooltip: {
                y: {
                    formatter: function(value) {
                        return value + ' clientes';
                    }
                }
            }
        };
        
        const chart = new ApexCharts(
            document.getElementById('customer-segments-chart'),
            chartOptions
        );
        chart.render();
    }
    
    /**
     * Carga predicciones de abandono de carrito
     */
    loadCartAbandonmentPrediction() {
        // En un entorno real, aquí enviarías el ID de sesión actual
        fetch('/api/ml/cart_abandonment_prediction?session_id=current')
            .then(response => response.json())
            .then(data => {
                this.renderCartAbandonmentData(data);
            })
            .catch(error => {
                console.error('Error al cargar predicción de abandono:', error);
                // Mostrar datos de ejemplo si falla la petición
                this.renderCartAbandonmentData(this.getSampleAbandonmentData());
            });
    }
    
    /**
     * Renderiza datos de predicción de abandono de carrito
     */
    renderCartAbandonmentData(data) {
        // Actualizar métricas
        document.getElementById('cart-abandonment-rate').textContent = data.prediction.probability + '%';
        document.getElementById('model-accuracy').textContent = data.model_metrics.accuracy + '%';
        
        // Crear gráfico de factores
        const chartOptions = {
            series: [{
                name: 'Influencia',
                data: data.factors.map(factor => factor.weight)
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(2);
                },
                offsetX: 20
            },
            xaxis: {
                categories: data.factors.map(factor => factor.name)
            },
            colors: ['#f6c23e'],
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val.toFixed(2) + ' (importancia relativa)';
                    }
                }
            }
        };
        
        const chart = new ApexCharts(
            document.getElementById('abandonment-factors-chart'),
            chartOptions
        );
        chart.render();
    }
    
    /**
     * Carga datos de análisis de sentimientos
     */
    loadSentimentAnalysis() {
        fetch('/api/reviews/sentiment')
            .then(response => response.json())
            .then(data => {
                this.renderSentimentAnalysis(data);
            })
            .catch(error => {
                console.error('Error al cargar análisis de sentimientos:', error);
                // Mostrar datos de ejemplo si falla la petición
                this.renderSentimentAnalysis(this.getSampleSentimentData());
            });
    }
    
    /**
     * Renderiza gráficos de análisis de sentimientos
     */
    renderSentimentAnalysis(data) {
        // Gráfico de distribución de sentimientos
        const pieOptions = {
            series: [data.positive, data.neutral, data.negative],
            chart: {
                type: 'donut',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            labels: ['Positivo', 'Neutral', 'Negativo'],
            colors: ['#1cc88a', '#f6c23e', '#e74a3b'],
            legend: {
                position: 'bottom'
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + '%';
                    }
                }
            }
        };
        
        const pieChart = new ApexCharts(
            document.getElementById('sentiment-analysis-chart'),
            pieOptions
        );
        pieChart.render();
        
        // Gráfico de tendencias de sentimiento
        const trendOptions = {
            series: [{
                name: 'Positivo',
                data: data.trends.map(item => item.positive)
            }, {
                name: 'Neutral',
                data: data.trends.map(item => item.neutral)
            }, {
                name: 'Negativo',
                data: data.trends.map(item => item.negative)
            }],
            chart: {
                type: 'line',
                height: 200,
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: ['#1cc88a', '#f6c23e', '#e74a3b'],
            xaxis: {
                categories: data.trends.map(item => item.period)
            },
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0) + '%';
                    }
                }
            },
            legend: {
                position: 'top'
            }
        };
        
        const trendChart = new ApexCharts(
            document.getElementById('sentiment-trends-chart'),
            trendOptions
        );
        trendChart.render();
    }
    
    /**
     * Carga lista de clientes para el selector
     */
    loadCustomers() {
        // En un entorno real, esta información vendría de la API
        const sampleCustomers = [
            { id: 1, name: 'Juan Pérez' },
            { id: 2, name: 'María García' },
            { id: 3, name: 'Carlos López' },
            { id: 4, name: 'Ana Martínez' },
            { id: 5, name: 'Roberto Fernández' }
        ];
        
        // Limpiar selector
        this.customerSelector.innerHTML = '<option value="">Seleccionar cliente</option>';
        
        // Añadir opciones
        sampleCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            this.customerSelector.appendChild(option);
        });
    }
    
    /**
     * Carga recomendaciones para un cliente específico
     */
    loadRecommendations() {
        const customerId = this.customerSelector.value;
        if (!customerId) {
            return;
        }
        
        fetch(`/api/ml/product_recommendations?customer_id=${customerId}`)
            .then(response => response.json())
            .then(data => {
                this.renderRecommendations(data);
            })
            .catch(error => {
                console.error('Error al cargar recomendaciones:', error);
                // Mostrar datos de ejemplo si falla la petición
                this.renderRecommendations(this.getSampleRecommendations());
            });
    }
    
    /**
     * Renderiza recomendaciones de productos
     */
    renderRecommendations(data) {
        const container = document.getElementById('recommendations-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay recomendaciones disponibles para este cliente</div>';
            return;
        }
        
        let html = '<div class="row">';
        
        data.forEach(product => {
            html += `
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text text-muted">${product.category}</p>
                            <p class="text-primary font-weight-bold">$${product.price.toFixed(2)}</p>
                            <div class="d-flex align-items-center">
                                <div class="recommendation-score">
                                    <span class="badge bg-success">${product.score}% match</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    /**
     * Actualiza métricas de rendimiento de modelos
     */
    updateModelPerformance() {
        const modelType = this.modelSelector.value;
        
        // En un entorno real, esta información vendría de la API
        const modelPerformance = this.getSampleModelPerformance(modelType);
        
        // Actualizar métricas
        document.getElementById('model-precision').textContent = modelPerformance.precision + '%';
        document.getElementById('model-recall').textContent = modelPerformance.recall + '%';
        document.getElementById('model-f1').textContent = modelPerformance.f1 + '%';
        
        // Renderizar gráfico de rendimiento
        const chartOptions = {
            series: [{
                name: 'Precisión',
                data: modelPerformance.history.map(h => h.precision)
            }, {
                name: 'Recall',
                data: modelPerformance.history.map(h => h.recall)
            }, {
                name: 'F1-Score',
                data: modelPerformance.history.map(h => h.f1)
            }],
            chart: {
                type: 'line',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            xaxis: {
                categories: modelPerformance.history.map(h => h.date)
            },
            yaxis: {
                min: 0,
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0) + '%';
                    }
                }
            },
            colors: ['#4e73df', '#1cc88a', '#f6c23e'],
            legend: {
                position: 'top'
            }
        };
        
        // Destruir gráfico anterior si existe
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }
        
        // Crear nuevo gráfico
        this.performanceChart = new ApexCharts(
            document.getElementById('model-performance-chart'),
            chartOptions
        );
        this.performanceChart.render();
    }
    
    // Métodos para generar datos de ejemplo
    
    getSampleSegmentData() {
        return [
            { name: 'Compradores frecuentes', count: 842 },
            { name: 'Compradores ocasionales', count: 1253 },
            { name: 'Nuevos clientes', count: 753 },
            { name: 'Clientes inactivos', count: 486 },
            { name: 'Clientes potenciales', count: 324 }
        ];
    }
    
    getSampleAbandonmentData() {
        return {
            prediction: {
                probability: 67.5,
                is_likely_to_abandon: true
            },
            model_metrics: {
                accuracy: 83.2,
                precision: 79.1,
                recall: 76.5
            },
            factors: [
                { name: 'Precio elevado', weight: 8.7 },
                { name: 'Tiempo en carrito', weight: 7.2 },
                { name: 'Dispositivo móvil', weight: 5.8 },
                { name: 'Historial de abandono', weight: 4.9 },
                { name: 'Hora del día', weight: 3.6 }
            ]
        };
    }
    
    getSampleSentimentData() {
        return {
            positive: 62,
            neutral: 28,
            negative: 10,
            trends: [
                { period: 'Ene', positive: 58, neutral: 32, negative: 10 },
                { period: 'Feb', positive: 60, neutral: 30, negative: 10 },
                { period: 'Mar', positive: 57, neutral: 31, negative: 12 },
                { period: 'Abr', positive: 61, neutral: 29, negative: 10 },
                { period: 'May', positive: 65, neutral: 27, negative: 8 },
                { period: 'Jun', positive: 62, neutral: 28, negative: 10 }
            ]
        };
    }
    
    getSampleRecommendations() {
        return [
            { id: 101, name: 'Smartphone XYZ', category: 'Electrónica', price: 599.99, score: 95 },
            { id: 203, name: 'Auriculares Bluetooth', category: 'Accesorios', price: 79.99, score: 92 },
            { id: 308, name: 'Smartwatch Sport', category: 'Wearables', price: 199.99, score: 87 },
            { id: 415, name: 'Funda Protectora', category: 'Accesorios', price: 24.99, score: 85 },
            { id: 502, name: 'Cargador Inalámbrico', category: 'Accesorios', price: 39.99, score: 82 },
            { id: 609, name: 'Tablet Ultra', category: 'Electrónica', price: 349.99, score: 78 }
        ];
    }
    
    getSampleModelPerformance(modelType) {
        const performances = {
            all: {
                precision: 81.5,
                recall: 78.3,
                f1: 79.9,
                history: [
                    { date: 'Ene', precision: 78.1, recall: 75.2, f1: 76.6 },
                    { date: 'Feb', precision: 79.3, recall: 76.1, f1: 77.7 },
                    { date: 'Mar', precision: 80.2, recall: 77.5, f1: 78.8 },
                    { date: 'Abr', precision: 80.9, recall: 77.8, f1: 79.3 },
                    { date: 'May', precision: 81.3, recall: 78.0, f1: 79.6 },
                    { date: 'Jun', precision: 81.5, recall: 78.3, f1: 79.9 }
                ]
            },
            segment: {
                precision: 85.2,
                recall: 82.1,
                f1: 83.6,
                history: [
                    { date: 'Ene', precision: 81.3, recall: 79.2, f1: 80.2 },
                    { date: 'Feb', precision: 82.5, recall: 80.0, f1: 81.2 },
                    { date: 'Mar', precision: 83.4, recall: 80.8, f1: 82.1 },
                    { date: 'Abr', precision: 84.2, recall: 81.3, f1: 82.7 },
                    { date: 'May', precision: 84.8, recall: 81.8, f1: 83.3 },
                    { date: 'Jun', precision: 85.2, recall: 82.1, f1: 83.6 }
                ]
            },
            abandonment: {
                precision: 79.1,
                recall: 76.5,
                f1: 77.8,
                history: [
                    { date: 'Ene', precision: 75.3, recall: 72.1, f1: 73.7 },
                    { date: 'Feb', precision: 76.5, recall: 73.2, f1: 74.8 },
                    { date: 'Mar', precision: 77.4, recall: 74.3, f1: 75.8 },
                    { date: 'Abr', precision: 78.2, recall: 75.1, f1: 76.6 },
                    { date: 'May', precision: 78.7, recall: 76.0, f1: 77.3 },
                    { date: 'Jun', precision: 79.1, recall: 76.5, f1: 77.8 }
                ]
            },
            recommendation: {
                precision: 83.7,
                recall: 80.2,
                f1: 81.9,
                history: [
                    { date: 'Ene', precision: 79.2, recall: 76.3, f1: 77.7 },
                    { date: 'Feb', precision: 80.5, recall: 77.5, f1: 79.0 },
                    { date: 'Mar', precision: 81.8, recall: 78.4, f1: 80.1 },
                    { date: 'Abr', precision: 82.6, recall: 79.0, f1: 80.8 },
                    { date: 'May', precision: 83.2, recall: 79.8, f1: 81.5 },
                    { date: 'Jun', precision: 83.7, recall: 80.2, f1: 81.9 }
                ]
            },
            sentiment: {
                precision: 78.3,
                recall: 74.8,
                f1: 76.5,
                history: [
                    { date: 'Ene', precision: 73.5, recall: 70.8, f1: 72.1 },
                    { date: 'Feb', precision: 74.8, recall: 71.5, f1: 73.1 },
                    { date: 'Mar', precision: 75.9, recall: 72.4, f1: 74.1 },
                    { date: 'Abr', precision: 76.7, recall: 73.2, f1: 74.9 },
                    { date: 'May', precision: 77.5, recall: 74.1, f1: 75.7 },
                    { date: 'Jun', precision: 78.3, recall: 74.8, f1: 76.5 }
                ]
            }
        };
        
        return performances[modelType] || performances.all;
    }
}

// Inicializar módulo cuando se cargue el documento
document.addEventListener('DOMContentLoaded', () => {
    window.mlAnalysis = new MachineLearningAnalysis();
});