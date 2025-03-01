/**
 * Configuración y gestión de gráficos
 */
class Charts {
    /**
     * Inicializa la clase de gráficos
     */
    constructor() {
        this.chartInstances = {};
    }

    /**
     * Inicializa el gráfico de tendencia de ventas
     * @param {Array} data - Datos para el gráfico
     */
    initSalesTrendChart(data) {
        const options = {
            series: [{
                name: 'Ventas',
                data: data.map(item => item.value)
            }],
            chart: {
                height: 350,
                type: 'area',
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
                width: 3
            },
            colors: ['#4361ee'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: data.map(item => item.date),
                labels: {
                    formatter: function(value) {
                        const date = new Date(value);
                        return date.getDate() + '/' + (date.getMonth() + 1);
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        return Math.round(value);
                    }
                }
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy'
                }
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.salesTrend) {
            this.chartInstances.salesTrend.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.salesTrend = new ApexCharts(
            document.getElementById('sales-trend-chart'),
            options
        );
        this.chartInstances.salesTrend.render();
    }

    /**
     * Inicializa el gráfico de productos más vendidos
     * @param {Array} data - Datos para el gráfico
     */
    initTopProductsChart(data) {
        const options = {
            series: [{
                name: 'Ventas',
                data: data.map(item => item.sales)
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
                    borderRadius: 4,
                    horizontal: true,
                    distributed: true,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            colors: data.map((_, index) => Utils.getChartColor(index)),
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val;
                },
                offsetX: 20
            },
            xaxis: {
                categories: data.map(item => item.name)
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + " unidades";
                    }
                }
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.topProducts) {
            this.chartInstances.topProducts.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.topProducts = new ApexCharts(
            document.getElementById('top-products-chart'),
            options
        );
        this.chartInstances.topProducts.render();
    }

    /**
     * Inicializa el mapa de calor de ubicaciones
     * @param {Array} data - Datos para el gráfico
     */
    initLocationHeatmap(data) {
        // Simulamos un mapa del mundo simplificado como contenedor
        const container = document.getElementById('location-heatmap');
        container.innerHTML = '<div class="world-map-container"><div id="heatmap-canvas"></div></div>';

        // Configuración de Heatmap.js
        const heatmapInstance = h337.create({
            container: document.getElementById('heatmap-canvas'),
            radius: 20,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.8
        });

        // Generar datos para el heatmap
        const heatmapData = {
            max: Math.max(...data.map(point => point.value)),
            data: data
        };

        // Establecer datos
        heatmapInstance.setData(heatmapData);
    }

    /**
     * Inicializa el gráfico de abandono de carrito
     * @param {Array} data - Datos para el gráfico
     */
    initCartAbandonmentChart(data) {
        const options = {
            series: [
                {
                    name: 'Abandonos',
                    data: data.map(item => item.count)
                }
            ],
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
                    columnWidth: '60%',
                }
            },
            colors: ['#ef4444'],
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.map(item => item.time_range),
                labels: {
                    rotate: -45,
                    rotateAlways: false
                }
            },
            yaxis: {
                title: {
                    text: 'Cantidad de abandonos'
                }
            },
            title: {
                text: 'Tiempo de abandono de carrito',
                align: 'center'
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.cartAbandonment) {
            this.chartInstances.cartAbandonment.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.cartAbandonment = new ApexCharts(
            document.getElementById('cart-abandonment-chart'),
            options
        );
        this.chartInstances.cartAbandonment.render();
    }

    /**
     * Inicializa el gráfico de demografía por edad
     * @param {Array} data - Datos para el gráfico
     */
    initAgeChart(data) {
        const options = {
            series: [{
                name: 'Clientes',
                data: data.map(item => item.count)
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
                    borderRadius: 4,
                    columnWidth: '50%',
                    distributed: true
                }
            },
            colors: data.map((_, index) => Utils.getChartColor(index)),
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.map(item => item.group),
                labels: {
                    style: {
                        colors: data.map(() => '#333'),
                        fontSize: '12px'
                    }
                }
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.ageChart) {
            this.chartInstances.ageChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.ageChart = new ApexCharts(
            document.getElementById('age-chart'),
            options
        );
        this.chartInstances.ageChart.render();
    }

    /**
     * Inicializa el gráfico de demografía por género
     * @param {Array} data - Datos para el gráfico
     */
    initGenderChart(data) {
        const options = {
            series: data.map(item => item.count),
            chart: {
                type: 'donut',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            labels: data.map(item => item.gender),
            colors: data.map((_, index) => Utils.getChartColor(index + 5)),
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return Math.round(val) + "%";
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + " clientes";
                    }
                }
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.genderChart) {
            this.chartInstances.genderChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.genderChart = new ApexCharts(
            document.getElementById('gender-chart'),
            options
        );
        this.chartInstances.genderChart.render();
    }

    /**
     * Inicializa el gráfico de demografía por ubicación
     * @param {Array} data - Datos para el gráfico
     */
    initLocationChart(data) {
        const options = {
            series: [{
                name: 'Clientes',
                data: data.map(item => item.count)
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
                    borderRadius: 4,
                    horizontal: true,
                    distributed: true
                }
            },
            colors: data.map((_, index) => Utils.getChartColor(index + 2)),
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.map(item => item.country)
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.locationChart) {
            this.chartInstances.locationChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.locationChart = new ApexCharts(
            document.getElementById('location-chart'),
            options
        );
        this.chartInstances.locationChart.render();
    }

    /**
     * Inicializa el gráfico de análisis de sentimiento
     * @param {Object} data - Datos para el gráfico
     */
    initSentimentChart(data) {
        const options = {
            series: [data.positive, data.neutral, data.negative],
            chart: {
                type: 'donut',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            labels: ['Positivo', 'Neutral', 'Negativo'],
            colors: ['#10b981', '#94a3b8', '#ef4444'],
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return Math.round(val) + "%";
                }
            },
            tooltip: {
                y: {
                    formatter: function(val, opts) {
                        const total = opts.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        const percent = Math.round(val / total * 100);
                        return percent + "% (" + val + " reviews)";
                    }
                }
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.sentimentChart) {
            this.chartInstances.sentimentChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.sentimentChart = new ApexCharts(
            document.getElementById('sentiment-chart'),
            options
        );
        this.chartInstances.sentimentChart.render();
    }

    /**
     * Inicializa el gráfico de temas de reviews
     * @param {Array} data - Datos para el gráfico
     */
    initTopicsChart(data) {
        const options = {
            series: [{
                name: 'Menciones',
                data: data.map(item => item.count)
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
                    borderRadius: 4,
                    horizontal: true,
                    distributed: true
                }
            },
            colors: data.map((_, index) => Utils.getChartColor(index)),
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.map(item => item.topic)
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.topicsChart) {
            this.chartInstances.topicsChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.topicsChart = new ApexCharts(
            document.getElementById('topics-chart'),
            options
        );
        this.chartInstances.topicsChart.render();
    }

    /**
     * Inicializa el gráfico de segmentos de clientes
     * @param {Array} data - Datos para el gráfico
     */
    initCustomerSegmentsChart(data) {
        const options = {
            series: data.map(item => item.count),
            chart: {
                type: 'pie',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            labels: data.map(item => item.segment),
            colors: data.map((_, index) => Utils.getChartColor(index)),
            legend: {
                position: 'bottom'
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + " clientes";
                    }
                }
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.segmentsChart) {
            this.chartInstances.segmentsChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.segmentsChart = new ApexCharts(
            document.getElementById('customer-segments-chart'),
            options
        );
        this.chartInstances.segmentsChart.render();
    }

    /**
     * Inicializa el gráfico de inventario por categoría
     * @param {Array} data - Datos para el gráfico
     */
    initInventoryChart(data) {
        const options = {
            series: [{
                name: 'Stock',
                data: data.map(item => item.stock)
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
                    borderRadius: 4,
                    horizontal: false,
                    columnWidth: '55%',
                    distributed: true
                }
            },
            colors: data.map((_, index) => Utils.getChartColor(index)),
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.map(item => item.category)
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.inventoryChart) {
            this.chartInstances.inventoryChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.inventoryChart = new ApexCharts(
            document.getElementById('inventory-chart'),
            options
        );
        this.chartInstances.inventoryChart.render();
    }

    /**
     * Inicializa el gráfico de rendimiento de proveedores
     * @param {Array} data - Datos para el gráfico
     */
    initSupplierPerformanceChart(data) {
        const options = {
            series: [{
                name: 'Tiempo de entrega',
                data: data.map(item => item.delivery_time)
            }, {
                name: 'Satisfacción',
                data: data.map(item => item.satisfaction)
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
                text: 'Rendimiento de Proveedores'
            },
            colors: ['#4361ee', '#f72585'],
            markers: {
                size: 4,
                colors: ['#4361ee', '#f72585'],
                strokeWidth: 2
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val;
                    }
                }
            },
            xaxis: {
                categories: data.map(item => item.name)
            },
            yaxis: {
                tickAmount: 5,
                min: 0,
                max: 100
            }
        };

        // Destruir gráfico existente si hay alguno
        if (this.chartInstances.supplierChart) {
            this.chartInstances.supplierChart.destroy();
        }

        // Crear nuevo gráfico
        this.chartInstances.supplierChart = new ApexCharts(
            document.getElementById('supplier-performance-chart'),
            options
        );
        this.chartInstances.supplierChart.render();
    }
}

// Inicializar la clase de gráficos
const charts = new Charts();