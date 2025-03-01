/**
 * Gestión de autenticación y permisos
 */
class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.permissions = [];
        this.initLoginModal();
        this.checkSession();
        this.setupListeners();
    }

    /**
     * Inicializa el modal de login
     */
    initLoginModal() {
        this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
            backdrop: 'static',
            keyboard: false
        });
    }

    /**
     * Verifica si hay una sesión activa
     */
    checkSession() {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                this.currentUser = JSON.parse(user);
                this.isAuthenticated = true;
                this.getPermissions();
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                this.loginModal.show();
            }
        } else {
            this.loginModal.show();
        }
    }

    /**
     * Configura los event listeners
     */
    setupListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.login();
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                this.logout();
            });
        }
    }

    /**
     * Realiza el login
     */
    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await Utils.fetchData('/api/users/login', 'POST', {
                username,
                password
            });

            if (response.success) {
                this.currentUser = response.user;
                this.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                this.loginModal.hide();
                this.getPermissions();
                Utils.showNotification(`Bienvenido, ${this.currentUser.name}`, 'success');
                
                // Actualizar la UI
                document.querySelector('.user-name').textContent = this.currentUser.name;
            } else {
                Utils.showNotification('Credenciales incorrectas', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            Utils.showNotification('Error de conexión', 'error');
            
            // Para fines de demo, permitimos acceso sin backend
            this.currentUser = {
                id: 1,
                username: username,
                name: 'Usuario Demo',
                role: 'admin'
            };
            this.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            this.loginModal.hide();
            Utils.showNotification(`Bienvenido, Modo Demo`, 'success');
            document.querySelector('.user-name').textContent = 'Usuario Demo';
        }
    }

    /**
     * Cierra la sesión
     */
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.permissions = [];
        localStorage.removeItem('user');
        this.loginModal.show();
        Utils.showNotification('Sesión cerrada', 'info');
    }

    /**
     * Obtiene los permisos del usuario actual
     */
    async getPermissions() {
        if (!this.currentUser) return;
        
        try {
            const response = await Utils.fetchData(`/api/users/permissions?user_id=${this.currentUser.id}`, 'GET');
            this.permissions = response.permissions || [];
        } catch (error) {
            console.error('Error fetching permissions:', error);
            
            // Para fines de demo, asignamos permisos básicos
            this.permissions = [
                'view_dashboard', 'view_customer', 'view_reviews', 
                'view_ml', 'view_inventory', 'view_settings',
                'export_reports', 'manage_users'
            ];
        }
        
        // Actualizar UI según permisos
        this.updateUIBasedOnPermissions();
    }

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }

    /**
     * Actualiza la UI basada en los permisos del usuario
     */
    updateUIBasedOnPermissions() {
        const navItems = document.querySelectorAll('.sidebar .nav-item');
        
        navItems.forEach(item => {
            const page = item.dataset.page;
            const permissionNeeded = `view_${page}`;
            
            if (!this.hasPermission(permissionNeeded)) {
                item.classList.add('disabled');
                item.setAttribute('title', 'No tiene permiso para acceder a esta sección');
            } else {
                item.classList.remove('disabled');
                item.removeAttribute('title');
            }
        });
    }
}

// Inicializar el sistema de autenticación
const auth = new Auth();