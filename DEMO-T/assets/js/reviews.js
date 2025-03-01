/**
 * Funcionalidad para la sección de análisis de opiniones y reviews
 */
class ReviewsAnalysis {
    /**
     * Inicializa el análisis de reviews
     */
    constructor() {
        this.pageId = 'reviews-page';
        this.page = document.getElementById(this.pageId);
        this.initialized = false;
    
        // Verifica si el botón de navegación existe antes de agregar el evento
        const btn = document.querySelector(`[data-page="reviews"]`);
        if (btn) {
            btn.addEventListener('click', () => this.showPage());
        }
    }
    
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
                            <h5 class="card-title">Análisis de Sentimiento</h5>
                            <div class="card-tools">
                                <select id="sentiment-product-filter" class="form-select form-select-sm">
                                    <option value="">Todos los productos</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <div class="metric-card sentiment-positive">
                                        <h6>Positivos</h6>
                                        <p class="metric-value" id="positive-sentiment">0%</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="metric-card sentiment-neutral">
                                        <h6>Neutros</h6>
                                        <p class="metric-value" id="neutral-sentiment">0%</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="metric-card sentiment-negative">
                                        <h6>Negativos</h6>
                                        <p class="metric-value" id="negative-sentiment">0%</p>
                                    </div>
                                </div>
                            </div>
                            <div id="sentiment-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Puntaje Promedio</h5>
                            <div class="card-tools">
                                <select id="score-category-filter" class="form-select form-select-sm">
                                    <option value="">Todas las categorías</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-12">
                                    <div class="metric-card">
                                        <h6>Promedio General</h6>
                                        <p class="metric-value" id="average-score">0.0 <i class="fas fa-star"></i></p>
                                    </div>
                                </div>
                            </div>
                            <div id="scores-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Temas Mencionados</h5>
                        </div>
                        <div class="card-body">
                            <div id="topics-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Palabras Clave</h5>
                        </div>
                        <div class="card-body">
                            <div id="keywords-cloud" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Reviews Recientes</h5>
                            <div class="card-tools">
                                <select id="review-sentiment-filter" class="form-select form-select-sm">
                                    <option value="all">Todos los sentimientos</option>
                                    <option value="positive">Positivos</option>
                                    <option value="neutral">Neutros</option>
                                    <option value="negative">Negativos</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Puntaje</th>
                                            <th>Comentario</th>
                                            <th>Sentimiento</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody id="reviews-table-body">
                                        <!-- Se llenará dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar filtros y event listeners
        this.initFilters();
    }
    
    /**
     * Inicializa los filtros de la página
     */
    initFilters() {
        // Filtro de sentimiento por producto
        this.sentimentProductFilter = document.getElementById('sentiment-product-filter');
        if (this.sentimentProductFilter) {
            this.sentimentProductFilter.addEventListener('change', () => {
                this.loadSentimentData(this.sentimentProductFilter.value);
            });
        }
        
        // Filtro de puntajes por categoría
        this.scoreCategoryFilter = document.getElementById('score-category-filter');
        if (this.scoreCategoryFilter) {
            this.scoreCategoryFilter.addEventListener('change', () => {
                this.loadScoresData(this.scoreCategoryFilter.value);
            });
        }
        
        // Filtro de reviews por sentimiento
        this.reviewSentimentFilter = document.getElementById('review-sentiment-filter');
        if (this.reviewSentimentFilter) {
            this.reviewSentimentFilter.addEventListener('change', () => {
                this.loadReviewsTable(this.reviewSentimentFilter.value);
            });
        }
    }
    
    /**
     * Carga todos los datos para la página de análisis de reviews
     */
    loadData() {
        this.loadFiltersData();
        this.loadSentimentData();
        this.loadScoresData();
        this.loadTopicsData();
        this.loadReviewsTable();
    }
    
    /**
     * Carga los datos para los filtros disponibles
     */
    loadFiltersData() {
        // Cargar opciones para el filtro de productos
        fetch('/api/reviews/sentiment?products=true')
            .then(response => response.json())
            .then(data => {
                if (data.products && data.products.length > 0) {
                    const productFilter = document.getElementById('sentiment-product-filter');
                    data.products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.textContent = product.name;
                        productFilter.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar opciones de productos:', error);
            });
        
        // Cargar opciones para el filtro de categorías
        fetch('/api/reviews/scores?categories=true')
            .then(response => response.json())
            .then(data => {
                if (data.categories && data.categories.length > 0) {
                    const categoryFilter = document.getElementById('score-category-filter');
                    data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category;
                        option.textContent = category;
                        categoryFilter.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar opciones de categorías:', error);
            });
    }
    
    /**
     * Carga datos de análisis de sentimiento
     */
    loadSentimentData(productId = null) {
        let url = '/api/reviews/sentiment';
        if (productId) {
            url += `?product_id=${productId}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Actualizar métricas
                document.getElementById('positive-sentiment').textContent = data.positive.toFixed(1) + '%';
                document.getElementById('neutral-sentiment').textContent = data.neutral.toFixed(1) + '%';
                document.getElementById('negative-sentiment').textContent = data.negative.toFixed(1) + '%';
                
                // Renderizar gráfico
                this.renderSentimentChart(data);
            })
            .catch(error => {
                console.error('Error al cargar datos de sentimiento:', error);
                this.loadDummySentimentData();
            });
    }
    
    /**
     * Carga datos de puntajes
     */
    loadScoresData(category = null) {
        let url = '/api/reviews/scores';
        if (category) {
            url += `?category=${category}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Actualizar promedio general
                document.getElementById('average-score').innerHTML = data.average.toFixed(1) + ' <i class="fas fa-star"></i>';
                
                // Renderizar gráfico
                this.renderScoresChart(data);
            })
            .catch(error => {
                console.error('Error al cargar datos de puntajes:', error);
                this.loadDummyScoresData();
            });
    }
    
    /**
     * Carga datos de temas mencionados
     */
    loadTopicsData() {
        fetch('/api/reviews/topics')
            .then(response => response.json())
            .then(data => {
                this.renderTopicsChart(data);
                this.renderKeywordsCloud(data.keywords);
            })
            .catch(error => {
                console.error('Error al cargar datos de temas:', error);
                this.loadDummyTopicsData();
            });
    }
    
    /**
     * Carga la tabla de reviews recientes
     */
    loadReviewsTable(sentimentFilter = 'all') {
        let url = '/api/reviews/recent';
        if (sentimentFilter !== 'all') {
            url += `?sentiment=${sentimentFilter}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('reviews-table-body');
                tableBody.innerHTML = '';
                
                if (data.reviews && data.reviews.length > 0) {
                    data.reviews.forEach(review => {
                        const row = document.createElement('tr');
                        
                        // Determinar clase de sentimiento
                        let sentimentClass = '';
                        if (review.sentiment === 'positive') {
                            sentimentClass = 'text-success';
                        } else if (review.sentiment === 'negative') {
                            sentimentClass = 'text-danger';
                        } else {
                            sentimentClass = 'text-secondary';
                        }
                        
                        // Formatear fecha
                        const date = new Date(review.at);
                        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                        
                        // Crear estrellas para el puntaje
                        const stars = '<i class="fas fa-star"></i>'.repeat(Math.floor(review.score)) + 
                                     (review.score % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : '') +
                                     '<i class="far fa-star"></i>'.repeat(5 - Math.ceil(review.score));
                        
                        row.innerHTML = `
                            <td>${review.product_name}</td>
                            <td>${stars}</td>
                            <td>${review.content.substring(0, 100)}${review.content.length > 100 ? '...' : ''}</td>
                            <td class="${sentimentClass}">${review.sentiment === 'positive' ? 'Positivo' : 
                                            review.sentiment === 'negative' ? 'Negativo' : 'Neutro'}</td>
                            <td>${formattedDate}</td>
                        `;
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay reviews disponibles</td></tr>`;
                }
            })
            .catch(error => {
                console.error('Error al cargar reviews recientes:', error);
                this.loadDummyReviewsTable();
            });
    }
    
    /**
     * Renderiza el gráfico de análisis de sentimiento
     */
    renderSentimentChart(data) {
        const options = {
            series: [{
                name: 'Porcentaje',
                data: [data.positive, data.neutral, data.negative]
            }],
            chart: {
                type: 'bar',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    distributed: true,
                    borderRadius: 5,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            colors: ['#4caf50', '#9e9e9e', '#f44336'],
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                },
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ["#333"]
                }
            },
            xaxis: {
                categories: ["Positivo", "Neutro", "Negativo"],
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                max: 100
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val.toFixed(1) + '%';
                    }
                }
            }
        };

        const chart = new ApexCharts(document.getElementById('sentiment-chart'), options);
        chart.render();
    }
    
    /**
     * Renderiza el gráfico de puntajes promedio
     */
    renderScoresChart(data) {
        const options = {
            series: [{
                name: 'Puntaje promedio',
                data: data.scores.map(item => item.score)
            }],
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
            colors: ['#ffc107'],
            markers: {
                size: 5,
                colors: ['#ffc107'],
                strokeColors: '#fff',
                strokeWidth: 2
            },
            xaxis: {
                categories: data.scores.map(item => item.product_name || item.category),
                labels: {
                    rotate: -45,
                    trim: true,
                    style: {
                        fontSize: '10px'
                    }
                }
            },
            yaxis: {
                min: 0,
                max: 5,
                tickAmount: 5
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val.toFixed(1) + ' ⭐';
                    }
                }
            }
        };

        const chart = new ApexCharts(document.getElementById('scores-chart'), options);
        chart.render();
    }
    
    /**
     * Renderiza el gráfico de temas mencionados
     */
    renderTopicsChart(data) {
        const options = {
            series: [
                {
                    name: "Menciones positivas",
                    data: data.topics.map(topic => topic.positive)
                },
                {
                    name: "Menciones neutras",
                    data: data.topics.map(topic => topic.neutral)
                },
                {
                    name: "Menciones negativas",
                    data: data.topics.map(topic => topic.negative)
                }
            ],
            chart: {
                type: 'bar',
                height: 300,
                stacked: true,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false
                }
            },
            colors: ['#4caf50', '#9e9e9e', '#f44336'],
            xaxis: {
                categories: data.topics.map(topic => topic.name),
                labels: {
                    rotate: -45,
                    trim: true
                }
            },
            legend: {
                position: 'top'
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + ' menciones';
                    }
                }
            }
        };

        const chart = new ApexCharts(document.getElementById('topics-chart'), options);
        chart.render();
    }
    
    /**
     * Renderiza la nube de palabras clave
     */
    renderKeywordsCloud(keywords) {
        const cloudContainer = document.getElementById('keywords-cloud');
        cloudContainer.innerHTML = '';
        
        // Crear nube de palabras clave
        keywords.forEach(keyword => {
            const span = document.createElement('span');
            span.className = 'keyword-item';
            
            // Aplicar estilo según el sentimiento
            if (keyword.sentiment === 'positive') {
                span.classList.add('keyword-positive');
            } else if (keyword.sentiment === 'negative') {
                span.classList.add('keyword-negative');
            } else {
                span.classList.add('keyword-neutral');
            }
            
            // Calcular tamaño basado en la frecuencia
            const fontSize = 12 + (keyword.frequency * 5);
            span.style.fontSize = `${fontSize}px`;
            
            span.textContent = keyword.word;
            cloudContainer.appendChild(span);
        });
    }
    
    /**
     * Carga datos dummy de sentimiento para demostración
     */
    loadDummySentimentData() {
        const dummyData = {
            positive: 65.2,
            neutral: 25.3,
            negative: 9.5
        };
        
        // Actualizar métricas
        document.getElementById('positive-sentiment').textContent = dummyData.positive.toFixed(1) + '%';
        document.getElementById('neutral-sentiment').textContent = dummyData.neutral.toFixed(1) + '%';
        document.getElementById('negative-sentiment').textContent = dummyData.negative.toFixed(1) + '%';
        
        // Renderizar gráfico
        this.renderSentimentChart(dummyData);
    }
    
    /**
     * Carga datos dummy de puntajes para demostración
     */
    loadDummyScoresData() {
        const dummyData = {
            average: 4.2,
            scores: [
                { product_name: 'Smartphone XYZ', score: 4.5 },
                { product_name: 'Laptop ABC', score: 4.2 },
                { product_name: 'Tablet 123', score: 3.8 },
                { product_name: 'Smartwatch Pro', score: 4.0 },
                { product_name: 'Auriculares Premium', score: 4.7 }
            ]
        };
        
        // Actualizar promedio general
        document.getElementById('average-score').innerHTML = dummyData.average.toFixed(1) + ' <i class="fas fa-star"></i>';
        
        // Renderizar gráfico
        this.renderScoresChart(dummyData);
    }
    
    /**
     * Carga datos dummy de temas para demostración
     */
    loadDummyTopicsData() {
        const dummyData = {
            topics: [
                { name: 'Calidad', positive: 120, neutral: 30, negative: 15 },
                { name: 'Precio', positive: 80, neutral: 40, negative: 50 },
                { name: 'Batería', positive: 60, neutral: 35, negative: 45 },
                { name: 'Servicio', positive: 90, neutral: 25, negative: 20 },
                { name: 'Envío', positive: 70, neutral: 30, negative: 25 }
            ],
            keywords: [
                { word: 'excelente', sentiment: 'positive', frequency: 12 },
                { word: 'bueno', sentiment: 'positive', frequency: 10 },
                { word: 'calidad', sentiment: 'positive', frequency: 8 },
                { word: 'precio', sentiment: 'neutral', frequency: 7 },
                { word: 'rápido', sentiment: 'positive', frequency: 5 },
                { word: 'defectuoso', sentiment: 'negative', frequency: 4 },
                { word: 'lento', sentiment: 'negative', frequency: 3 },
                { word: 'caro', sentiment: 'negative', frequency: 6 },
                { word: 'duradero', sentiment: 'positive', frequency: 4 },
                { word: 'normal', sentiment: 'neutral', frequency: 3 }
            ]
        };
        
        this.renderTopicsChart(dummyData);
        this.renderKeywordsCloud(dummyData.keywords);
    }
    
    /**
     * Carga datos dummy de reviews para demostración
     */
    loadDummyReviewsTable() {
        const dummyReviews = {
            reviews: [
                {
                    product_name: 'Smartphone XYZ',
                    score: 4.5,
                    content: 'Excelente teléfono, muy rápido y con una batería que dura todo el día. La cámara es increíble.',
                    sentiment: 'positive',
                    at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutos atrás
                },
                {
                    product_name: 'Laptop ABC',
                    score: 2.0,
                    content: 'Muy lenta y se calienta demasiado. No recomiendo esta compra.',
                    sentiment: 'negative',
                    at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hora atrás
                },
                {
                    product_name: 'Tablet 123',
                    score: 3.5,
                    content: 'Funciona bien para el uso diario, pero nada del otro mundo.',
                    sentiment: 'neutral',
                    at: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 horas atrás
                },
                {
                    product_name: 'Auriculares Premium',
                    score: 5.0,
                    content: '¡Increíble calidad de sonido! Sin duda los mejores auriculares que he tenido.',
                    sentiment: 'positive',
                    at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 horas atrás
                },
                {
                    product_name: 'Smartwatch Pro',
                    score: 1.5,
                    content: 'Pésima duración de batería y el GPS nunca funciona bien. Una completa pérdida de dinero.',
                    sentiment: 'negative',
                    at: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 horas atrás
                }
            ]
        };
        
        const reviewSentimentFilter = document.getElementById('review-sentiment-filter');
        const sentiment = reviewSentimentFilter ? reviewSentimentFilter.value : 'all';
        
        // Filtrar por sentimiento si es necesario
        let filteredReviews = dummyReviews.reviews;
        if (sentiment !== 'all') {
            filteredReviews = dummyReviews.reviews.filter(review => review.sentiment === sentiment);
        }
        
        const tableBody = document.getElementById('reviews-table-body');
        tableBody.innerHTML = '';
        
        if (filteredReviews.length > 0) {
            filteredReviews.forEach(review => {
                const row = document.createElement('tr');
                
                // Determinar clase de sentimiento
                let sentimentClass = '';
                if (review.sentiment === 'positive') {
                    sentimentClass = 'text-success';
                } else if (review.sentiment === 'negative') {
                    sentimentClass = 'text-danger';
                } else {
                    sentimentClass = 'text-secondary';
                }
                
                // Formatear fecha
                const date = new Date(review.at);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                // Crear estrellas para el puntaje
                const stars = '<i class="fas fa-star"></i>'.repeat(Math.floor(review.score)) + 
                             (review.score % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : '') +
                             '<i class="far fa-star"></i>'.repeat(5 - Math.ceil(review.score));
                
                row.innerHTML = `
                    <td>${review.product_name}</td>
                    <td>${stars}</td>
                    <td>${review.content.substring(0, 100)}${review.content.length > 100 ? '...' : ''}</td>
                    <td class="${sentimentClass}">${review.sentiment === 'positive' ? 'Positivo' : 
                                    review.sentiment === 'negative' ? 'Negativo' : 'Neutro'}</td>
                    <td>${formattedDate}</td>
                `;
                
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay reviews disponibles</td></tr>`;
        }
    }
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.reviewsAnalysis = new ReviewsAnalysis();
});