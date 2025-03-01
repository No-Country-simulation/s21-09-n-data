/**
 * Utilidades generales para la aplicación
 */
const Utils = {
    /**
     * Formatea un número como moneda
     * @param {number} value - Número a formatear
     * @param {string} currency - Símbolo de moneda (por defecto $)
     * @return {string} Número formateado como moneda
     */
    formatCurrency: (value, currency = '$') => {
        return currency + value.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Formatea un número como porcentaje
     * @param {number} value - Número a formatear (0-1)
     * @return {string} Número formateado como porcentaje
     */
    formatPercentage: (value) => {
        return (value * 100).toFixed(2) + '%';
    },

    /**
     * Formatea una fecha
     * @param {string|Date} date - Fecha a formatear
     * @param {string} format - Formato (short, long)
     * @return {string} Fecha formateada
     */
    formatDate: (date, format = 'short') => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (format === 'short') {
            return dateObj.toLocaleDateString('es-ES');
        } else if (format === 'long') {
            return dateObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (format === 'time') {
            return dateObj.toLocaleTimeString('es-ES', {
                hour: '2-digit', 
                minute: '2-digit'
            });
        } else if (format === 'datetime') {
            return `${dateObj.toLocaleDateString('es-ES')} ${dateObj.toLocaleTimeString('es-ES', {
                hour: '2-digit', 
                minute: '2-digit'
            })}`;
        }
        
        return dateObj.toLocaleDateString('es-ES');
    },

    /**
     * Crea un tiempo relativo (hace X minutos, etc.)
     * @param {string|Date} date - Fecha
     * @return {string} Tiempo relativo
     */
    timeAgo: (date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now - dateObj;
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        
        if (diffSec < 60) {
            return 'Hace unos segundos';
        } else if (diffMin < 60) {
            return `Hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
        } else if (diffHour < 24) {
            return `Hace ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
        } else if (diffDay < 7) {
            return `Hace ${diffDay} día${diffDay > 1 ? 's' : ''}`;
        } else {
            return Utils.formatDate(dateObj);
        }
    },

    /**
     * Genera colores aleatorios
     * @param {number} count - Número de colores a generar
     * @return {array} Array de colores en formato hex
     */
    generateColors: (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            // Generamos colores más vividos
            const hue = Math.floor(360 * (i / count));
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    },

    /**
     * Crea un degradado de color basado en un valor
     * @param {number} value - Valor (0-1)
     * @param {string} colorStart - Color inicio (por defecto rojo)
     * @param {string} colorEnd - Color fin (por defecto verde)
     * @return {string} Color en formato hex
     */
    getGradientColor: (value, colorStart = '#f44336', colorEnd = '#4caf50') => {
        // Convertimos hex a RGB
        const start = {
            r: parseInt(colorStart.slice(1, 3), 16),
            g: parseInt(colorStart.slice(3, 5), 16),
            b: parseInt(colorStart.slice(5, 7), 16)
        };
        
        const end = {
            r: parseInt(colorEnd.slice(1, 3), 16),
            g: parseInt(colorEnd.slice(3, 5), 16),
            b: parseInt(colorEnd.slice(5, 7), 16)
        };
        
        // Interpolamos entre los colores
        const r = Math.floor(start.r + (end.r - start.r) * value);
        const g = Math.floor(start.g + (end.g - start.g) * value);
        const b = Math.floor(start.b + (end.b - start.b) * value);
        
        // Convertimos de vuelta a hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },

    /**
     * Realiza una petición AJAX
     * @param {string} url - URL a la que realizar la petición
     * @param {string} method - Método HTTP (GET, POST, etc.)
     * @param {object} data - Datos a enviar (para POST)
     * @return {Promise} Promesa con la respuesta
     */
    fetchData: async (url, method = 'GET', data = null) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw error;
        }
    },

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, warning, error, info)
     * @param {number} duration - Duración en ms
     */
    showNotification: (message, type = 'info', duration = 3000) => {
        // Comprobamos si existe el contenedor
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
            
            // Añadimos estilos al contenedor
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
        }
        
        // Creamos la notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                             type === 'warning' ? 'exclamation-triangle' : 
                             type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Estilos de la notificación
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.padding = '15px';
        notification.style.marginBottom = '10px';
        notification.style.backgroundColor = type === 'success' ? '#4caf50' : 
                                          type === 'warning' ? '#ff9800' : 
                                          type === 'error' ? '#f44336' : '#2196f3';
        notification.style.color = '#fff';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.transform = 'translateX(120%)';
        notification.style.opacity = '0';
        
        // Estilos del botón de cierre
        const closeButton = notification.querySelector('.notification-close');
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = '#fff';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.marginLeft = '10px';
        
        // Añadimos la notificación al contenedor
        container.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Cerrar al hacer clic
        closeButton.addEventListener('click', () => {
            closeNotification();
        });
        
        // Cerrar automáticamente
        const timeout = setTimeout(() => {
            closeNotification();
        }, duration);
        
        // Función para cerrar la notificación
        function closeNotification() {
            clearTimeout(timeout);
            notification.style.transform = 'translateX(120%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    },

    /**
     * Exporta datos a CSV
     * @param {array} data - Array de objetos
     * @param {string} fileName - Nombre del archivo
     */
    exportToCSV: (data, fileName = 'export.csv') => {
        if (!data || data.length === 0) {
            console.error('No data to export');
            return;
        }
        
        // Obtenemos cabeceras (claves de los objetos)
        const headers = Object.keys(data[0]);
        
        // Creamos las filas CSV
        const csvRows = [];
        
        // Añadimos la fila de cabeceras
        csvRows.push(headers.join(','));
        
        // Añadimos las filas de datos
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                // Escapamos las comillas
                const escaped = String(value).replace(/"/g, '""');
                // Envolvemos en comillas si contiene comas o comillas
                return /[,"]/.test(escaped) ? `"${escaped}"` : escaped;
            });
            csvRows.push(values.join(','));
        }
        
        // Combinamos filas en un solo string
        const csvString = csvRows.join('\n');
        
        // Creamos blob y descargamos
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Exportamos el objeto Utils
window.Utils = Utils;