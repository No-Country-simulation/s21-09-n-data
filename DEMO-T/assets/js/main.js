/**
 * main.js - Script principal que coordina la funcionalidad del dashboard
 * E-Commerce Analytics Dashboard
 */

// Configuración global
const API_BASE_URL = 'http://localhost:5000/api';
let currentDateRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
};

// Cache para datos y configuraciones de usuario
const appState = {
    user: null,
    currentPage: 'dashboard',
    dashboardData: {},
    customerData: {},
    reviewsData: {},
    mlData: {},
    inventoryData: {},
    darkMode: false,
    sidebarCollapsed: false
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
document.addEventListener("DOMContentLoaded", function () {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", toggleDarkMode);
    } else {
        console.error("El botón de modo oscuro no se encontró en el DOM.");
    }
    applyThemePreference();
});
/**
 * Inicializa la aplicación web
 */
function initApp() {
    // Verificar si hay una sesión activa
    checkAuthStatus();
    
    // Inicializar componentes de UI
    initUIComponents();
    
    // Inicializar controladores de eventos
    initEventHandlers();
    
    // Cargar datos iniciales del dashboard
    if (appState.user) {
        loadDashboardData();
    }
}

/**
 * Verifica si el usuario tiene una sesión válida
 */
function checkAuthStatus() {
    const storedUser = localStorage.getItem('user'); 
    if (storedUser) {
        appState.user = JSON.parse(storedUser);
        hideLoginModal();
    } else {
        showLoginModal();
    }
}

/**
 * Inicializa componentes de UI como fechas predeterminadas, sidebar, etc.
 */
function initUIComponents() {
    // Inicializar selector de fechas
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    startDateInput.value = currentDateRange.startDate;
    endDateInput.value = currentDateRange.endDate;
    
    // Inicializar estado del sidebar
    const sidebar = document.getElementById('sidebar');
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        appState.sidebarCollapsed = true;
    }
    
    // Configurar estado del tema
    applyThemePreference();
}

/**
 * Aplica la preferencia de tema (claro/oscuro) guardada
 */
function applyThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const darkModeStyles = document.getElementById('dark-mode-styles');
    if (savedTheme === 'dark') {
        darkModeStyles.removeAttribute('disabled');
    } else {
        darkModeStyles.setAttribute('disabled', 'true');
    }

    updateThemeButtons(savedTheme);
}

function updateThemeButtons(selectedTheme) {
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        if (button.dataset.theme === selectedTheme) {
            button.classList.add('btn-primary'); // Activar botón
            button.classList.remove('btn-outline-primary');
        } else {
            button.classList.remove('btn-primary'); // Desactivar otros botones
            button.classList.add('btn-outline-primary');
        }
    });
}

/**
 * Inicializa todos los manejadores de eventos
 */
function initEventHandlers() {
    // Evento de envío del formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Evento para cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Evento para cambiar de página en el sidebar
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.dataset.page;
            navigateToPage(pageName);
        });
    });
    
    // Evento para aplicar filtro de fechas
    const applyDateBtn = document.getElementById('apply-date-filter');
    if (applyDateBtn) {
        applyDateBtn.addEventListener('click', applyDateFilter);
    }
    
    // Evento para alternar el sidebar
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
    }
    
    // Evento para alternar modo oscuro
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDarkMode);
    }
    
    // Eventos para intervalos de tendencia de ventas
    const intervalButtons = document.querySelectorAll('[data-interval]');
    intervalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remover clase active de todos los botones
            intervalButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            e.target.classList.add('active');
            // Actualizar gráfico de tendencia de ventas con el nuevo intervalo
            updateSalesTrendChart(e.target.dataset.interval);
        });
    });
}

/**
 * Maneja el envío del formulario de login
 * @param {Event} e - Evento de submit
 */
function handleLogin(e) {
    e.preventDefault();
    
    auth.login()
        .then(() => {
            appState.user = auth.currentUser;
            hideLoginModal();
            loadDashboardData();
        })
        .catch(error => {
            console.error('Error durante autenticación:', error);
            alert('Error de autenticación. Intente nuevamente.');
        });
}

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
    // Limpiar datos de sesión
    sessionStorage.removeItem('user');
    appState.user = null;
    
    // Mostrar modal de login
    showLoginModal();
}

/**
 * Muestra el modal de login
 */
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

/**
 * Oculta el modal de login
 */
function hideLoginModal() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) {
        loginModal.hide();
    }
}

/**
 * Alterna la visibilidad del sidebar
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    appState.sidebarCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', appState.sidebarCollapsed);
}

/**
 * Alterna entre modo claro y oscuro
 */
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const darkModeStyles = document.getElementById('dark-mode-styles');
    if (newTheme === 'dark') {
        darkModeStyles.removeAttribute('disabled');
    } else {
        darkModeStyles.setAttribute('disabled', 'true');
    }
    
    // Actualizar iconos y estilos adicionales
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    appState.darkMode = newTheme === 'dark';
    
    // Actualizar gráficos para reflejar el nuevo tema
    refreshAllCharts();
}

/**
 * Navega a una página específica del dashboard
 * @param {string} pageName - Nombre de la página a mostrar
 */
function navigateToPage(pageName) {
    if (pageName === appState.currentPage) return;
    
    // Actualizar estado actual
    appState.currentPage = pageName;
    
    // Actualizar clase activa en el sidebar
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.sidebar .nav-item[data-page="${pageName}"]`).classList.add('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar la página seleccionada
    const selectedPage = document.getElementById(`${pageName}-page`);
    selectedPage.classList.add('active');
    
    // Actualizar título de la página
    updatePageTitle(pageName);
    
    // Cargar datos específicos de la página si es necesario
    loadPageData(pageName);
}

/**
 * Actualiza el título de la página según la sección actual
 * @param {string} pageName - Nombre de la página actual
 */
function updatePageTitle(pageName) {
    const pageTitleElement = document.getElementById('page-title');
    let title = '';
    
    switch (pageName) {
        case 'dashboard':
            title = 'Dashboard Principal';
            break;
        case 'customer':
            title = 'Comportamiento del Cliente';
            break;
        case 'reviews':
            title = 'Análisis de Reviews';
            break;
        case 'ml':
            title = 'Machine Learning';
            break;
        case 'inventory':
            title = 'Gestión de Inventario';
            break;
        case 'settings':
            title = 'Configuraciones';
            break;
        default:
            title = 'E-Commerce Analytics';
    }
    
    pageTitleElement.textContent = title;
}

/**
 * Carga datos específicos según la página actual
 * @param {string} pageName - Nombre de la página actual
 */
function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'customer':
            loadCustomerPage();
            break;
        case 'reviews':
            loadReviewsPage();
            break;
        case 'ml':
            loadMLPage();
            break;
        case 'inventory':
            loadInventoryPage();
            break;
        case 'settings':
            loadSettingsPage();
            break;
    }
}

/**
 * Carga contenido en páginas que no tienen HTML predefinido
 */
function loadCustomerPage() {
    const customerPage = document.getElementById('customer-page');
    
    // Si ya está cargado, solo actualizar datos
    if (customerPage.innerHTML) {
        updateCustomerData();
        return;
    }
    
    // Cargar contenido HTML para la página de clientes
    customerPage.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Análisis de Abandono de Carrito</h5>
                    </div>
                    <div class="card-body">
                        <div id="cart-abandonment-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Demografía de Clientes</h5>
                    </div>
                    <div class="card-body">
                        <div id="customer-demographics-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Patrones de Compra</h5>
                    </div>
                    <div class="card-body">
                        <div id="purchase-patterns-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar datos y gráficos de cliente
    initCustomerCharts();
}

function loadReviewsPage() {
    const reviewsPage = document.getElementById('reviews-page');
    
    // Si ya está cargado, solo actualizar datos
    if (reviewsPage.innerHTML) {
        updateReviewsData();
        return;
    }
    
    // Cargar contenido HTML para la página de reviews
    reviewsPage.innerHTML = `
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
                        <div id="sentiment-analysis-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Temas Mencionados</h5>
                    </div>
                    <div class="card-body">
                        <div id="review-topics-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Distribución de Puntajes</h5>
                    </div>
                    <div class="card-body">
                        <div id="review-scores-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar datos y gráficos de reviews
    initReviewsCharts();
}

function loadMLPage() {
    const mlPage = document.getElementById('ml-page');
    
    // Si ya está cargado, solo actualizar datos
    if (mlPage.innerHTML) {
        updateMLData();
        return;
    }
    
    // Cargar contenido HTML para la página de machine learning
    mlPage.innerHTML = `
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
                        <div id="cart-abandonment-prediction-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Recomendaciones de Productos</h5>
                        <div class="card-tools">
                            <select id="recommendation-customer-filter" class="form-select form-select-sm">
                                <option value="">Seleccionar cliente</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="product-recommendations-container" class="recommendations-container">
                            <p class="text-center text-muted">Seleccione un cliente para ver recomendaciones</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar datos y gráficos de ML
    initMLCharts();
}

function loadInventoryPage() {
    const inventoryPage = document.getElementById('inventory-page');
    
    // Si ya está cargado, solo actualizar datos
    if (inventoryPage.innerHTML) {
        updateInventoryData();
        return;
    }
    
    // Cargar contenido HTML para la página de inventario
    inventoryPage.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Stock por Categoría</h5>
                        <div class="card-tools">
                            <select id="stock-category-filter" class="form-select form-select-sm">
                                <option value="">Todas las categorías</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="inventory-stock-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Alertas de Stock</h5>
                    </div>
                    <div class="card-body">
                        <ul class="alert-list" id="stock-alerts">
                            <li class="alert-loading">Cargando alertas...</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Rendimiento de Proveedores</h5>
                    </div>
                    <div class="card-body">
                        <div id="supplier-performance-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Impacto de Descuentos</h5>
                    </div>
                    <div class="card-body">
                        <div id="discount-impact-chart" class="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar datos y gráficos de inventario
    initInventoryCharts();
}

function loadSettingsPage() {
    const settingsPage = document.getElementById('settings-page');
    
    // Si ya está cargado, no hay necesidad de recargarlo
    if (settingsPage.innerHTML) {
        return;
    }
    
    // Cargar contenido HTML para la página de configuraciones
    settingsPage.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Preferencias de Visualización</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Tema</label>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-primary theme-button" data-theme="light">
                                    <i class="fas fa-sun"></i> Claro
                                </button>
                                <button class="btn btn-outline-primary theme-button" data-theme="dark">
                                    <i class="fas fa-moon"></i> Oscuro
                                </button>
                                <button class="btn btn-outline-primary theme-button" data-theme="auto">
                                    <i class="fas fa-magic"></i> Auto
                                </button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Gráficos predeterminados</label>
                            <select class="form-select" id="default-chart-type">
                                <option value="bar">Barras</option>
                                <option value="line">Líneas</option>
                                <option value="pie">Circular</option>
                            </select>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="enable-animations">
                            <label class="form-check-label" for="enable-animations">Habilitar animaciones</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Exportar Datos</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Tipo de reporte</label>
                            <select class="form-select" id="report-type">
                                <option value="sales">Ventas</option>
                                <option value="customers">Clientes</option>
                                <option value="inventory">Inventario</option>
                                <option value="reviews">Reviews</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Formato</label>
                            <select class="form-select" id="report-format">
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary" id="generate-report-btn">Generar Reporte</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Notificaciones y Alertas</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Selecciona las notificaciones que deseas recibir</label>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="notify-inventory">
                                <label class="form-check-label" for="notify-inventory">Baja en Inventario</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="notify-orders">
                                <label class="form-check-label" for="notify-orders">Retraso en Pedidos</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="notify-sales">
                                <label class="form-check-label" for="notify-sales">Picos de Venta</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Canal de Notificación</label>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="channel-email">
                                <label class="form-check-label" for="channel-email">Correo Electrónico</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="channel-sms">
                                <label class="form-check-label" for="channel-sms">SMS</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="channel-inapp">
                                <label class="form-check-label" for="channel-inapp">Notificación en la Plataforma</label>
                            </div>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary" id="save-notifications-btn">Guardar Configuración</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Gestión de Usuarios y Permisos</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Seleccionar Usuario</label>
                            <select class="form-select" id="user-select">
                                <option value="admin">Administrador</option>
                                <option value="analyst">Analista</option>
                                <option value="inventory">Gestor de Inventario</option>
                            </select>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="manage-orders">
                            <label class="form-check-label" for="manage-orders">Gestionar Pedidos</label>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="manage-inventory">
                            <label class="form-check-label" for="manage-inventory">Gestionar Inventario</label>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary" id="save-permissions-btn">Guardar Permisos</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Frecuencia de Actualización de Datos</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Selecciona la frecuencia de actualización</label>
                            <select class="form-select" id="data-refresh-rate">
                                <option value="5">Cada 5 minutos</option>
                                <option value="15">Cada 15 minutos</option>
                                <option value="60">Cada hora</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary" id="save-refresh-settings">Guardar Configuración</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Modo de Mantenimiento</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="maintenance-mode">
                            <label class="form-check-label" for="maintenance-mode">Activar modo de mantenimiento</label>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Mensaje de mantenimiento</label>
                            <textarea class="form-control" id="maintenance-message" rows="3" placeholder="Escribe un mensaje de mantenimiento"></textarea>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary" id="save-maintenance-settings">Guardar Configuración</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    `;
    
    // Inicializar eventos para la página de configuraciones
    initSettingsEvents();
}

/**
 * Inicializa eventos para los controles en la página de configuraciones
 */
function initSettingsEvents() {
    // Evento para botones de tema
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme === 'auto') {
                // Detectar preferencia del sistema
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                localStorage.setItem('theme', 'auto');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                
                const darkModeStyles = document.getElementById('dark-mode-styles');
                if (theme === 'dark') {
                    darkModeStyles.removeAttribute('disabled');
                } else {
                    darkModeStyles.setAttribute('disabled', 'true');
                }
            }
            updateThemeButtons(theme);
            // Actualizar UI
            refreshAllCharts();
        });
    });
    
    // Evento para generar reporte
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    
    // Cargar configuraciones guardadas
    applyThemePreference();
}

/**
 * Carga configuraciones guardadas por el usuario
 */
function loadSavedSettings() {
    // Cargar tipo de gráfico predeterminado
    const defaultChartType = localStorage.getItem('defaultChartType') || 'bar';
    document.getElementById('default-chart-type').value = defaultChartType;
    
    // Cargar estado de animaciones
    const enableAnimations = localStorage.getItem('enableAnimations') !== 'false';
    document.getElementById('enable-animations').checked = enableAnimations;
    
    // Marcar botón de tema activo
    const currentTheme = localStorage.getItem('theme') || 'light';
    const themeButton = document.querySelector(`.theme-button[data-theme="${currentTheme}"]`);
    if (themeButton) {
        themeButton.classList.add('active');
    }
}

/**
 * Genera y descarga un reporte
 */
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportFormat = document.getElementById('report-format').value;
    
    // Construir URL para la descarga
    const url = `${API_BASE_URL}/reports/export?type=${reportType}&format=${reportFormat}&start_date=${currentDateRange.startDate}&end_date=${currentDateRange.endDate}`;
    
    // Crear un enlace temporal y simular click para descargar
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.click();
}

/**
 * Aplica el filtro de fechas seleccionado y recarga los datos
 */
function applyDateFilter() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    // Validar fechas
    if (!startDate || !endDate) {
        alert('Por favor seleccione fechas válidas');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('La fecha de inicio debe ser anterior a la fecha de fin');
        return;
    }
    
    // Actualizar rango de fechas actual
    currentDateRange.startDate = startDate;
    currentDateRange.endDate = endDate;
    
    // Recargar datos de la página actual
    loadPageData(appState.currentPage);
}

/**
 * Actualiza el gráfico de tendencia de ventas con el intervalo especificado
 * @param {string} interval - Intervalo para agrupar datos (day, week, month)
 */
function updateSalesTrendChart(interval) {
    fetchSalesTrends(interval)
        .then(data => {
            // Actualizar gráfico con nuevos datos
            updateChartData('sales-trend-chart', data);
        })
        .catch(error => {
            console.error('Error al obtener tendencia de ventas:', error);
        });
}

/**
 * Obtiene tendencias de ventas del API
 * @param {string} interval - Intervalo para agrupar datos
 * @returns {Promise} - Promesa con los datos de tendencia
 */
function fetchSalesTrends(interval) {
    return fetch(`${API_BASE_URL}/dashboard/sales_trends?start_date=${currentDateRange.startDate}&end_date=${currentDateRange.endDate}&interval=${interval}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener tendencias de ventas');
            }
            return response.json();
        });
}

/**
 * Carga los datos del dashboard principal
 */
function loadDashboardData() {
    // Obtener resumen del dashboard
    fetch(`${API_BASE_URL}/dashboard/summary?start_date=${currentDateRange.startDate}&end_date=${currentDateRange.endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener resumen del dashboard');
            }
            return response.json();
        })
        .then(data => {
            // Guardar datos en el estado
            appState.dashboardData.summary = data;
            
            // Actualizar UI con los datos obtenidos
            updateDashboardUI(data);
        })
        .catch(error => {
            console.error('Error al cargar datos del dashboard:', error);
        });
    
    // Obtener tendencias de ventas para el gráfico principal
    fetchSalesTrends('day')
        .then(data => {
            appState.dashboardData.salesTrends = data;
            
            // Inicializar gráfico de tendencias si no existe
            if (!window.dashboardCharts || !window.dashboardCharts['sales-trend-chart']) {
                initSalesTrendChart(data);
            } else {
                // Actualizar datos del gráfico existente
                updateChartData('sales-trend-chart', data);
            }
        })
        .catch(error => {
            console.error('Error al obtener tendencia de ventas:', error);
        });
    
    // Obtener datos del mapa de calor
    fetch(`${API_BASE_URL}/dashboard/location_heatmap`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos del mapa de calor');
            }
            return response.json();
        })
        .then(data => {
            appState.dashboardData.locationHeatmap = data;
            
            // Inicializar heatmap
            initLocationHeatmap(data);
        })
        .catch(error => {
            console.error('Error al cargar datos del mapa de calor:', error);
        });
}

/**
 * Actualiza la UI del dashboard con los datos obtenidos
 * @param {Object} data - Datos del resumen del dashboard
 */
function updateDashboardUI(data) {
    // Actualizar métricas clave
    document.getElementById('total-sales').textContent = data.total_sales.toLocaleString();
    document.getElementById('conversion-rate').textContent = data.conversion_rate.toFixed(2) + '%';
    document.getElementById('total-revenue').textContent = '$' + data.total_revenue.toLocaleString();
    document.getElementById('available-stock').textContent = data.available_stock.toLocaleString();
    
    // Actualizar gráfico de productos más vendidos
    if (!window.dashboardCharts) {
        window.dashboardCharts = {};
    }
    if (window.dashboardCharts.topProductsChart) {
        window.dashboardCharts.topProductsChart.destroy();
    }
    const ctx = document.getElementById('top-products-chart').getContext('2d');
    window.dashboardCharts.topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.top_products.map(p => p.name),
            datasets: [{
                label: 'Ventas',
                data: data.top_products.map(p => p.sales),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
    
    // Actualizar actividad reciente
    const activityList = document.getElementById('recent-activity');
    activityList.innerHTML = '';
    data.recent_activity.forEach(activity => {
        const li = document.createElement('li');
        li.classList.add('activity-item');
        li.innerHTML = `
            <div class="activity-icon"><i class="${activity.icon}"></i></div>
            <div class="activity-content">
                <p class="activity-text">${activity.text}</p>
                <p class="activity-time">${activity.time}</p>
            </div>
        `;
        activityList.appendChild(li);
    });
}