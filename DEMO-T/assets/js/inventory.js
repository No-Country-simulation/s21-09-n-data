/**
 * Funcionalidad para la sección de Gestión de Inventario
 */
class InventoryManager {
    /**
     * Inicializa el gestor de inventario
     */
    constructor() {
        this.pageId = 'inventory-page';
        this.page = document.getElementById(this.pageId);
        this.initialized = false;

        // Verifica si el botón de navegación existe antes de agregar el evento
        const btn = document.querySelector(`[data-page="inventory"]`);
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
                <div class="col-lg-3 col-md-6">
                    <div class="card metric-card">
                        <div class="card-body">
                            <div class="metric-icon">
                                <i class="fas fa-cubes"></i>
                            </div>
                            <div class="metric-content">
                                <h5 class="metric-title">Stock Total</h5>
                                <p class="metric-value" id="total-stock">0</p>
                                <p class="metric-trend up"><i class="fas fa-arrow-up"></i> <span id="stock-trend">0%</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="card metric-card">
                        <div class="card-body">
                            <div class="metric-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="metric-content">
                                <h5 class="metric-title">Alertas Stock Bajo</h5>
                                <p class="metric-value" id="low-stock-count">0</p>
                                <p class="metric-trend down"><i class="fas fa-arrow-down"></i> <span id="alert-trend">0%</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="card metric-card">
                        <div class="card-body">
                            <div class="metric-icon">
                                <i class="fas fa-shipping-fast"></i>
                            </div>
                            <div class="metric-content">
                                <h5 class="metric-title">Pedidos Pendientes</h5>
                                <p class="metric-value" id="pending-orders">0</p>
                                <p class="metric-trend up"><i class="fas fa-arrow-up"></i> <span id="orders-trend">0%</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="card metric-card">
                        <div class="card-body">
                            <div class="metric-icon">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="metric-content">
                                <h5 class="metric-title">Proveedores Activos</h5>
                                <p class="metric-value" id="active-suppliers">0</p>
                                <p class="metric-trend neutral"><i class="fas fa-minus"></i> <span id="suppliers-trend">0%</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Niveles de Stock por Categoría</h5>
                            <div class="card-tools">
                                <select id="stock-category-filter" class="form-select form-select-sm">
                                    <option value="">Todas las categorías</option>
                                    <option value="electronics">Electrónica</option>
                                    <option value="clothing">Ropa</option>
                                    <option value="home">Hogar</option>
                                    <option value="beauty">Belleza</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="stock-levels-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Alertas de Stock Bajo</h5>
                        </div>
                        <div class="card-body">
                            <ul class="alert-list" id="low-stock-alerts">
                                <li class="placeholder-item">Cargando alertas...</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Rendimiento de Proveedores</h5>
                            <div class="card-tools">
                                <select id="supplier-filter" class="form-select form-select-sm">
                                    <option value="">Todos los proveedores</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="supplier-performance-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Impacto de Descuentos en Ventas</h5>
                            <div class="card-tools">
                                <select id="product-discount-filter" class="form-select form-select-sm">
                                    <option value="">Seleccionar producto</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="discount-impact-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar selectores y eventos
        this.initSelectors();
    }
    
    /**
     * Inicializa los selectores y eventos de filtrado
     */
    initSelectors() {
        // Filtro de categoría para stock
        const categoryFilter = document.getElementById('stock-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.loadStockData(categoryFilter.value);
            });
        }
        
        // Filtro de proveedor
        const supplierFilter = document.getElementById('supplier-filter');
        if (supplierFilter) {
            supplierFilter.addEventListener('change', () => {
                this.loadSupplierPerformance(supplierFilter.value);
            });
        }
        
        // Filtro de producto para descuentos
        const productFilter = document.getElementById('product-discount-filter');
        if (productFilter) {
            productFilter.addEventListener('change', () => {
                this.loadDiscountImpact(productFilter.value);
            });
        }
    }
    
    /**
     * Carga todos los datos de la sección de inventario
     */
    loadData() {
        // Actualizar el título de la página
        document.getElementById('page-title').textContent = 'Gestión de Inventario';
        
        // Cargar datos generales
        this.loadSummaryMetrics();
        
        // Cargar datos de stock por categoría
        this.loadStockData();
        
        // Cargar alertas de stock bajo
        this.loadLowStockAlerts();
        
        // Cargar datos de proveedores y llenar el selector
        this.loadSuppliersList();
        
        // Cargar lista de productos para el selector de descuentos
        this.loadProductsList();
    }
    
    /**
     * Carga las métricas de resumen
     */
    loadSummaryMetrics() {
        fetch('/api/inventory/stock')
            .then(response => response.json())
            .then(data => {
                // Calcular stock total
                const totalStock = data.reduce((sum, item) => sum + item.stock_level, 0);
                document.getElementById('total-stock').textContent = totalStock.toLocaleString();
                document.getElementById('stock-trend').textContent = '5.2%';
                
                // Datos simulados para otras métricas
                document.getElementById('low-stock-count').textContent = '12';
                document.getElementById('alert-trend').textContent = '8.3%';
                document.getElementById('pending-orders').textContent = '27';
                document.getElementById('orders-trend').textContent = '12.5%';
                document.getElementById('active-suppliers').textContent = '8';
                document.getElementById('suppliers-trend').textContent = '0%';
            })
            .catch(error => {
                console.error('Error al cargar métricas de inventario:', error);
                showNotification('error', 'Error al cargar datos de inventario');
            });
    }
    
    /**
     * Carga y visualiza los datos de stock
     * @param {string} category - Categoría para filtrar (opcional)
     */
    loadStockData(category = '') {
        const url = category 
            ? `/api/inventory/stock?category=${category}` 
            : '/api/inventory/stock';
            
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Preparar datos para el gráfico
                const chartData = this.prepareStockChartData(data);
                
                // Renderizar gráfico de barras
                this.renderStockLevelsChart(chartData);
            })
            .catch(error => {
                console.error('Error al cargar datos de stock:', error);
                showNotification('error', 'Error al cargar niveles de stock');
            });
    }
    
    /**
     * Prepara los datos para el gráfico de niveles de stock
     * @param {Array} data - Datos de stock
     * @returns {Object} Datos formateados para el gráfico
     */
    prepareStockChartData(data) {
        // Agrupar productos por categoría
        const categories = {};
        
        data.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = {
                    name: item.category,
                    total: 0,
                    low: 0,
                    optimal: 0,
                    excess: 0
                };
            }
            
            categories[item.category].total += item.stock_level;
            
            // Clasificar según nivel de stock
            if (item.stock_level < 10) {
                categories[item.category].low += item.stock_level;
            } else if (item.stock_level < 50) {
                categories[item.category].optimal += item.stock_level;
            } else {
                categories[item.category].excess += item.stock_level;
            }
        });
        
        return Object.values(categories);
    }
    
    /**
     * Renderiza el gráfico de niveles de stock
     * @param {Array} data - Datos formateados para el gráfico
     */
    renderStockLevelsChart(data) {
        const options = {
            series: [
                {
                    name: 'Stock Bajo',
                    data: data.map(item => item.low)
                },
                {
                    name: 'Stock Óptimo',
                    data: data.map(item => item.optimal)
                },
                {
                    name: 'Stock Excesivo',
                    data: data.map(item => item.excess)
                }
            ],
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                toolbar: {
                    show: true
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: data.map(item => item.name)
            },
            yaxis: {
                title: {
                    text: 'Unidades'
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " unidades"
                    }
                }
            },
            colors: ['#FF4560', '#00E396', '#008FFB']
        };

        const chart = new ApexCharts(document.getElementById('stock-levels-chart'), options);
        chart.render();
    }
    
    /**
     * Carga las alertas de stock bajo
     */
    loadLowStockAlerts() {
        fetch('/api/inventory/alerts')
            .then(response => response.json())
            .then(data => {
                const alertList = document.getElementById('low-stock-alerts');
                
                if (data.length === 0) {
                    alertList.innerHTML = '<li class="no-alerts">No hay alertas de stock bajo</li>';
                    return;
                }
                
                let html = '';
                data.forEach(item => {
                    html += `
                        <li class="alert-item">
                            <div class="alert-icon ${item.stock_level < 5 ? 'critical' : 'warning'}">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-content">
                                <p class="alert-title">${item.product_name}</p>
                                <p class="alert-description">Stock: <strong>${item.stock_level}</strong> unidades</p>
                                <p class="alert-category">${item.category}</p>
                            </div>
                            <div class="alert-action">
                                <button class="btn btn-sm btn-primary" data-product-id="${item.product_id}">
                                    <i class="fas fa-sync-alt"></i> Reponer
                                </button>
                            </div>
                        </li>
                    `;
                });
                
                alertList.innerHTML = html;
                
                // Agregar eventos a los botones de acción
                alertList.querySelectorAll('button[data-product-id]').forEach(button => {
                    button.addEventListener('click', () => {
                        this.restockProduct(button.getAttribute('data-product-id'));
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar alertas de stock bajo:', error);
                document.getElementById('low-stock-alerts').innerHTML = 
                    '<li class="error-item">Error al cargar alertas</li>';
            });
    }
    
    /**
     * Simula la reposición de un producto
     * @param {string} productId - ID del producto a reponer
     */
    restockProduct(productId) {
        showNotification('info', 'Solicitando reposición de stock para el producto ' + productId, 5000);
        
        // Aquí se enviaría una solicitud al servidor para reponer el stock
        // Por ahora simulamos la respuesta
        setTimeout(() => {
            showNotification('success', 'Reposición de stock solicitada correctamente', 3000);
            // Actualizar la lista de alertas
            this.loadLowStockAlerts();
        }, 1500);
    }
    
    /**
     * Carga la lista de proveedores
     */
    loadSuppliersList() {
        // Simulamos la carga de proveedores
        const supplierFilter = document.getElementById('supplier-filter');
        
        const suppliers = [
            { id: 'sup1', name: 'Proveedor Electrónica X' },
            { id: 'sup2', name: 'Textiles Y' },
            { id: 'sup3', name: 'Distribuidora Z' },
            { id: 'sup4', name: 'Importadora Global' }
        ];
        
        let options = '<option value="">Todos los proveedores</option>';
        suppliers.forEach(supplier => {
            options += `<option value="${supplier.id}">${supplier.name}</option>`;
        });
        
        supplierFilter.innerHTML = options;
        
        // Cargar rendimiento del primer proveedor
        this.loadSupplierPerformance(suppliers[0].id);
    }
    
    /**
     * Carga y visualiza el rendimiento de un proveedor
     * @param {string} supplierId - ID del proveedor
     */
    loadSupplierPerformance(supplierId = '') {
        if (!supplierId) return;
        
        fetch(`/api/inventory/supplier_performance?supplier_id=${supplierId}`)
            .then(response => response.json())
            .then(data => {
                this.renderSupplierPerformanceChart(data);
            })
            .catch(error => {
                console.error('Error al cargar rendimiento de proveedor:', error);
                showNotification('error', 'Error al cargar datos de proveedor');
            });
    }
    
    /**
     * Renderiza el gráfico de rendimiento de proveedores
     * @param {Object} data - Datos de rendimiento del proveedor
     */
    renderSupplierPerformanceChart(data) {
        const options = {
            series: [{
                name: 'Tiempo de entrega',
                data: data.delivery_times
            }, {
                name: 'Calidad del producto',
                data: data.quality_scores
            }, {
                name: 'Completitud de pedidos',
                data: data.completeness
            }],
            chart: {
                type: 'radar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: true
            },
            plotOptions: {
                radar: {
                    size: 140,
                    polygons: {
                        strokeColors: '#e9e9e9',
                        fill: {
                            colors: ['#f8f8f8', '#fff']
                        }
                    }
                }
            },
            title: {
                text: 'Rendimiento del Proveedor',
                align: 'center'
            },
            colors: ['#FF4560', '#00E396', '#FEB019'],
            markers: {
                size: 4,
                colors: ['#fff'],
                strokeColors: ['#FF4560', '#00E396', '#FEB019'],
                strokeWidth: 2
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val.toFixed(1);
                    }
                }
            },
            xaxis: {
                categories: data.months
            },
            yaxis: {
                min: 0,
                max: 10
            }
        };

        // Limpiar el contenedor antes de renderizar
        document.getElementById('supplier-performance-chart').innerHTML = '';
        
        const chart = new ApexCharts(document.getElementById('supplier-performance-chart'), options);
        chart.render();
    }
    
    /**
     * Carga la lista de productos para el selector de descuentos
     */
    loadProductsList() {
        // Simulamos la lista de productos
        const productFilter = document.getElementById('product-discount-filter');
        
        const products = [
            { id: 'prod1', name: 'Smartphone X Pro' },
            { id: 'prod2', name: 'Laptop Ultra' },
            { id: 'prod3', name: 'Auriculares Premium' },
            { id: 'prod4', name: 'Cámara DSLR' }
        ];
        
        let options = '<option value="">Seleccionar producto</option>';
        products.forEach(product => {
            options += `<option value="${product.id}">${product.name}</option>`;
        });
        
        productFilter.innerHTML = options;
        
        // Cargar impacto de descuentos para el primer producto
        this.loadDiscountImpact(products[0].id);
    }
    
    /**
     * Carga y visualiza el impacto de descuentos en ventas
     * @param {string} productId - ID del producto
     */
    loadDiscountImpact(productId = '') {
        if (!productId) return;
        
        fetch(`/api/inventory/discount_impact?product_id=${productId}`)
            .then(response => response.json())
            .then(data => {
                this.renderDiscountImpactChart(data);
            })
            .catch(error => {
                console.error('Error al cargar impacto de descuentos:', error);
                showNotification('error', 'Error al cargar datos de descuentos');
            });
    }
    
    /**
     * Renderiza el gráfico de impacto de descuentos
     * @param {Object} data - Datos de impacto de descuentos
     */
    renderDiscountImpactChart(data) {
        const options = {
            series: [{
                name: 'Ventas',
                type: 'column',
                data: data.sales
            }, {
                name: 'Descuento',
                type: 'line',
                data: data.discounts
            }],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
                toolbar: {
                    show: true
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: [1, 4]
            },
            title: {
                text: 'Ventas vs Descuento Aplicado',
                align: 'center'
            },
            xaxis: {
                categories: data.dates,
            },
            yaxis: [
                {
                    title: {
                        text: 'Ventas (unidades)',
                    },
                },
                {
                    opposite: true,
                    title: {
                        text: 'Descuento (%)'
                    }
                }
            ],
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (y, { seriesIndex }) {
                        if (seriesIndex === 0) {
                            return y + " unidades";
                        } else {
                            return y + "%";
                        }
                    }
                }
            },
            colors: ['#00E396', '#FF4560']
        };

        // Limpiar el contenedor antes de renderizar
        document.getElementById('discount-impact-chart').innerHTML = '';
        
        const chart = new ApexCharts(document.getElementById('discount-impact-chart'), options);
        chart.render();
    }
}

// Inicializar el gestor de inventario cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryManager = new InventoryManager();
});




