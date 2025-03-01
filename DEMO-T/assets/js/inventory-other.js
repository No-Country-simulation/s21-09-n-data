/**
 * Módulo para la gestión del inventario
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
                                <select id="category-filter" class="form-select form-select-sm">
                                    <option value="">Todas las Categorías</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="inventory-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Alertas de Stock Bajo</h5>
                        </div>
                        <div class="card-body">
                            <ul class="alerts-list" id="low-stock-alerts">
                                <!-- Las alertas se cargarán dinámicamente -->
                                <li class="alert-placeholder">Cargando alertas...</li>
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
                                    <option value="">Todos los Proveedores</option>
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
                            <h5 class="card-title">Impacto de Descuentos</h5>
                            <div class="card-tools">
                                <select id="product-discount-filter" class="form-select form-select-sm">
                                    <option value="">Todos los Productos</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="discount-impact-chart" class="chart-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Listado de Inventario</h5>
                            <div class="card-tools">
                                <input type="text" id="inventory-search" class="form-control form-control-sm" placeholder="Buscar producto...">
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Producto</th>
                                            <th>Categoría</th>
                                            <th>Stock</th>
                                            <th>Precio</th>
                                            <th>Descuento</th>
                                            <th>Proveedor</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="inventory-table-body">
                                        <!-- El contenido se cargará dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="inventory-pagination mt-3">
                                <nav aria-label="Navegación de inventario">
                                    <ul class="pagination justify-content-center" id="inventory-pagination">
                                        <!-- La paginación se cargará dinámicamente -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar event listeners
        this.initEventListeners();
    }
    
    /**
     * Inicializa los event listeners para la interactividad
     */
    initEventListeners() {
        // Filtro de categoría
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.loadStockByCategory(categoryFilter.value);
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
        
        // Búsqueda en inventario
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.filterInventoryTable(searchInput.value);
            }, 300));
        }
    }
    
    /**
     * Carga los datos iniciales
     */
    loadData() {
        document.getElementById('page-title').innerText = 'Gestión de Inventario';
        
        // Cargar métricas
        this.loadInventoryMetrics();
        
        // Cargar stock por categoría
        this.loadStockByCategory();
        
        // Cargar alertas de stock bajo
        this.loadLowStockAlerts();
        
        // Cargar rendimiento de proveedores
        this.loadSupplierPerformance();
        
        // Cargar impacto de descuentos
        this.loadDiscountImpact();
        
        // Cargar tabla de inventario
        this.loadInventoryTable();
        
        // Cargar opciones de filtros
        this.loadFilterOptions();
    }
    
    /**
     * Carga las métricas principales del inventario
     */
    loadInventoryMetrics() {
        fetch('/api/inventory/stock')
            .then(response => response.json())
            .then(data => {
                // Actualizar total de stock
                const totalStock = data.reduce((sum, item) => sum + item.stock, 0);
                document.getElementById('total-stock').innerText = totalStock.toLocaleString();
                document.getElementById('stock-trend').innerText = '5.2%';
                
                // Obtener datos de alertas
                fetch('/api/inventory/alerts')
                    .then(response => response.json())
                    .then(alerts => {
                        document.getElementById('low-stock-count').innerText = alerts.length.toLocaleString();
                        document.getElementById('alert-trend').innerText = '2.8%';
                    })
                    .catch(error => console.error('Error cargando alertas:', error));
                
                // Simulación de pedidos pendientes y proveedores activos
                // En una implementación real, estos datos vendrían de la API
                document.getElementById('pending-orders').innerText = '42';
                document.getElementById('orders-trend').innerText = '8.3%';
                
                const uniqueSuppliers = new Set(data.map(item => item.supplier_id)).size;
                document.getElementById('active-suppliers').innerText = uniqueSuppliers;
                document.getElementById('suppliers-trend').innerText = '0%';
            })
            .catch(error => console.error('Error cargando métricas de inventario:', error));
    }
    
    /**
     * Carga el gráfico de stock por categoría
     * @param {string} category Categoría opcional para filtrar
     */
    loadStockByCategory(category = '') {
        const url = category ? `/api/inventory/stock?category=${category}` : '/api/inventory/stock';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Agrupar por categoría
                const stockByCategory = {};
                data.forEach(item => {
                    if (!stockByCategory[item.category]) {
                        stockByCategory[item.category] = 0;
                    }
                    stockByCategory[item.category] += item.stock;
                });
                
                // Preparar datos para el gráfico
                const categories = Object.keys(stockByCategory);
                const stockValues = Object.values(stockByCategory);
                
                // Crear o actualizar gráfico
                if (this.inventoryChart) {
                    this.inventoryChart.updateOptions({
                        xaxis: { categories },
                        series: [{ data: stockValues }]
                    });
                } else {
                    this.inventoryChart = new ApexCharts(
                        document.getElementById('inventory-chart'),
                        {
                            chart: {
                                type: 'bar',
                                height: 350,
                                toolbar: {
                                    show: false
                                }
                            },
                            series: [{
                                name: 'Stock',
                                data: stockValues
                            }],
                            xaxis: {
                                categories,
                                title: {
                                    text: 'Categoría'
                                }
                            },
                            yaxis: {
                                title: {
                                    text: 'Unidades'
                                }
                            },
                            colors: ['#4e73df'],
                            plotOptions: {
                                bar: {
                                    borderRadius: 4,
                                    horizontal: false,
                                    columnWidth: '60%'
                                }
                            },
                            dataLabels: {
                                enabled: false
                            },
                            tooltip: {
                                y: {
                                    formatter: function(val) {
                                        return val.toLocaleString() + ' unidades';
                                    }
                                }
                            }
                        }
                    );
                    this.inventoryChart.render();
                }
            })
            .catch(error => console.error('Error cargando stock por categoría:', error));
    }
    
    /**
     * Carga las alertas de stock bajo
     */
    loadLowStockAlerts() {
        fetch('/api/inventory/alerts')
            .then(response => response.json())
            .then(alerts => {
                const alertsList = document.getElementById('low-stock-alerts');
                
                if (alerts.length === 0) {
                    alertsList.innerHTML = '<li class="no-alerts">No hay alertas de stock bajo.</li>';
                    return;
                }
                
                // Generar HTML de alertas
                alertsList.innerHTML = alerts.map(alert => `
                    <li class="alert-item">
                        <div class="alert-icon ${alert.level === 'critical' ? 'critical' : 'warning'}">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="alert-content">
                            <p class="alert-text">
                                <strong>${alert.product_name}</strong> - ${alert.stock} unidades
                            </p>
                            <p class="alert-info">
                                Umbral: ${alert.threshold} | Categoría: ${alert.category}
                            </p>
                        </div>
                        <div class="alert-action">
                            <button class="btn btn-sm btn-outline-primary order-btn" data-product-id="${alert.product_id}">
                                <i class="fas fa-plus"></i> Ordenar
                            </button>
                        </div>
                    </li>
                `).join('');
                
                // Agregar event listeners a los botones de ordenar
                document.querySelectorAll('.order-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const productId = btn.dataset.productId;
                        this.showOrderModal(productId);
                    });
                });
            })
            .catch(error => console.error('Error cargando alertas de stock bajo:', error));
    }
    
    /**
     * Muestra modal para ordenar producto
     * @param {string} productId ID del producto
     */
    showOrderModal(productId) {
        alert(`Funcionalidad para ordenar producto ${productId} en desarrollo`);
        // Aquí iría la implementación del modal de pedido
    }
    
    /**
     * Carga los datos de rendimiento de proveedores
     * @param {string} supplierId ID del proveedor opcional para filtrar
     */
    loadSupplierPerformance(supplierId = '') {
        const url = supplierId ? `/api/inventory/supplier_performance?supplier_id=${supplierId}` : '/api/inventory/supplier_performance';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Preparar datos para el gráfico
                const suppliers = data.map(item => item.supplier_name);
                const performance = data.map(item => item.performance_score);
                const deliveryTimes = data.map(item => item.avg_delivery_time);
                
                // Crear o actualizar gráfico
                if (this.supplierChart) {
                    this.supplierChart.updateOptions({
                        xaxis: { categories: suppliers },
                        series: [
                            { name: 'Rendimiento', data: performance },
                            { name: 'Tiempo Entrega (días)', data: deliveryTimes }
                        ]
                    });
                } else {
                    this.supplierChart = new ApexCharts(
                        document.getElementById('supplier-performance-chart'),
                        {
                            chart: {
                                type: 'line',
                                height: 350,
                                toolbar: {
                                    show: false
                                }
                            },
                            series: [
                                {
                                    name: 'Rendimiento',
                                    type: 'column',
                                    data: performance
                                },
                                {
                                    name: 'Tiempo Entrega (días)',
                                    type: 'line',
                                    data: deliveryTimes
                                }
                            ],
                            stroke: {
                                width: [0, 3],
                                curve: 'smooth'
                            },
                            xaxis: {
                                categories: suppliers,
                                title: {
                                    text: 'Proveedor'
                                }
                            },
                            yaxis: [
                                {
                                    title: {
                                        text: 'Rendimiento (%)'
                                    },
                                    max: 100
                                },
                                {
                                    opposite: true,
                                    title: {
                                        text: 'Días de Entrega'
                                    }
                                }
                            ],
                            colors: ['#4e73df', '#1cc88a'],
                            dataLabels: {
                                enabled: false
                            },
                            tooltip: {
                                y: {
                                    formatter: function(val, { seriesIndex }) {
                                        return seriesIndex === 0 ? 
                                            val.toFixed(1) + '%' : 
                                            val.toFixed(1) + ' días';
                                    }
                                }
                            }
                        }
                    );
                    this.supplierChart.render();
                }
            })
            .catch(error => console.error('Error cargando rendimiento de proveedores:', error));
    }
    
    /**
     * Carga los datos del impacto de descuentos
     * @param {string} productId ID del producto opcional para filtrar
     */
    loadDiscountImpact(productId = '') {
        const url = productId ? `/api/inventory/discount_impact?product_id=${productId}` : '/api/inventory/discount_impact';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Preparar datos para el gráfico
                const discountLevels = data.map(item => item.discount_level + '%');
                const sales = data.map(item => item.sales);
                const revenue = data.map(item => item.revenue);
                
                // Crear o actualizar gráfico
                if (this.discountChart) {
                    this.discountChart.updateOptions({
                        xaxis: { categories: discountLevels },
                        series: [
                            { name: 'Ventas', data: sales },
                            { name: 'Ingresos', data: revenue }
                        ]
                    });
                } else {
                    this.discountChart = new ApexCharts(
                        document.getElementById('discount-impact-chart'),
                        {
                            chart: {
                                type: 'line',
                                height: 350,
                                toolbar: {
                                    show: false
                                }
                            },
                            series: [
                                {
                                    name: 'Ventas',
                                    data: sales
                                },
                                {
                                    name: 'Ingresos',
                                    data: revenue
                                }
                            ],
                            stroke: {
                                width: 3,
                                curve: 'smooth'
                            },
                            xaxis: {
                                categories: discountLevels,
                                title: {
                                    text: 'Nivel de Descuento'
                                }
                            },
                            yaxis: [
                                {
                                    title: {
                                        text: 'Ventas (unidades)'
                                    }
                                },
                                {
                                    opposite: true,
                                    title: {
                                        text: 'Ingresos ($)'
                                    },
                                    labels: {
                                        formatter: function(val) {
                                            return '$' + val.toFixed(0);
                                        }
                                    }
                                }
                            ],
                            colors: ['#36b9cc', '#f6c23e'],
                            markers: {
                                size: 5
                            },
                            tooltip: {
                                y: {
                                    formatter: function(val, { seriesIndex }) {
                                        return seriesIndex === 0 ? 
                                            val.toLocaleString() + ' unidades' : 
                                            '$' + val.toLocaleString();
                                    }
                                }
                            }
                        }
                    );
                    this.discountChart.render();
                }
            })
            .catch(error => console.error('Error cargando impacto de descuentos:', error));
    }
    
    /**
     * Carga la tabla de inventario con paginación
     * @param {number} page Número de página
     */
    loadInventoryTable(page = 1) {
        const limit = 10; // Elementos por página
        
        fetch(`/api/inventory/stock?page=${page}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('inventory-table-body');
                
                if (data.items.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="9" class="text-center">No hay productos en el inventario</td>
                        </tr>
                    `;
                    return;
                }
                
                // Generar filas de la tabla
                tableBody.innerHTML = data.items.map(item => `
                    <tr>
                        <td>${item.product_id}</td>
                        <td>${item.product_name}</td>
                        <td>${item.category}</td>
                        <td>
                            <div class="stock-bar">
                                <div class="stock-progress" style="width: ${Math.min(100, (item.stock / item.threshold) * 100)}%; 
                                    background-color: ${item.stock < item.threshold ? '#e74a3b' : '#1cc88a'}">
                                </div>
                            </div>
                            <span>${item.stock} / ${item.threshold}</span>
                        </td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.discount}%</td>
                        <td>${item.supplier_name}</td>
                        <td>
                            <span class="status-badge ${item.stock < item.threshold ? 'low' : 'ok'}">
                                ${item.stock < item.threshold ? 'Stock Bajo' : 'OK'}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-primary edit-product" data-product-id="${item.product_id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-success order-product" data-product-id="${item.product_id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Generar paginación
                const totalPages = Math.ceil(data.total / limit);
                this.renderPagination(page, totalPages);
                
                // Agregar event listeners a los botones
                this.initTableActions();
            })
            .catch(error => console.error('Error cargando tabla de inventario:', error));
    }
    
    /**
     * Genera los controles de paginación
     * @param {number} currentPage Página actual
     * @param {number} totalPages Total de páginas
     */
    renderPagination(currentPage, totalPages) {
        const pagination = document.getElementById('inventory-pagination');
        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
            </li>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Botón siguiente
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Agregar event listeners a los enlaces de paginación
        document.querySelectorAll('#inventory-pagination .page-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    this.loadInventoryTable(page);
                }
            });
        });
    }
    
    /**
     * Inicializa las acciones de la tabla de inventario
     */
    initTableActions() {
        // Botones de edición
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.productId;
                alert(`Funcionalidad para editar producto ${productId} en desarrollo`);
                // Aquí iría la implementación del modal de edición
            });
        });
        
        // Botones de pedido
        document.querySelectorAll('.order-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.productId;
                this.showOrderModal(productId);
            });
        });
    }

    /**
     * Filtra la tabla de inventario según el término de búsqueda
     * @param {string} searchTerm Término de búsqueda
     */
    filterInventoryTable(searchTerm) {
        if (!searchTerm) {
            this.loadInventoryTable(); // Recargar tabla original si no hay término
            return;
        }
        
        searchTerm = searchTerm.toLowerCase();
        
        fetch('/api/inventory/stock')
            .then(response => response.json())
            .then(data => {
                // Filtrar elementos que coincidan con la búsqueda
                const filteredItems = data.filter(item => 
                    item.product_name.toLowerCase().includes(searchTerm) ||
                    item.category.toLowerCase().includes(searchTerm) ||
                    item.product_id.toString().includes(searchTerm)
                );
                
                const tableBody = document.getElementById('inventory-table-body');
                
                if (filteredItems.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="9" class="text-center">No se encontraron productos que coincidan con "${searchTerm}"</td>
                        </tr>
                    `;
                    
                    // Limpiar paginación
                    document.getElementById('inventory-pagination').innerHTML = '';
                    return;
                }
                
                // Generar filas de la tabla
                tableBody.innerHTML = filteredItems.map(item => `
                    <tr>
                        <td>${item.product_id}</td>
                        <td>${item.product_name}</td>
                        <td>${item.category}</td>
                        <td>
                            <div class="stock-bar">
                                <div class="stock-progress" style="width: ${Math.min(100, (item.stock / item.threshold) * 100)}%; 
                                    background-color: ${item.stock < item.threshold ? '#e74a3b' : '#1cc88a'}">
                                </div>
                            </div>
                            <span>${item.stock} / ${item.threshold}</span>
                        </td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.discount}%</td>
                        <td>${item.supplier_name}</td>
                        <td>
                            <span class="status-badge ${item.stock < item.threshold ? 'low' : 'ok'}">
                                ${item.stock < item.threshold ? 'Bajo' : 'Disponible'}
                            </span>
                        </td>
                        <td>
                            <button class="edit-product" data-product-id="${item.product_id}">Editar</button>
                            <button class="order-product" data-product-id="${item.product_id}">Ordenar</button>
                        </td>
                    </tr>
                `).join('');
            });
    }
}


// Inicializar el gestor de inventario cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryManager = new InventoryManager();
});

