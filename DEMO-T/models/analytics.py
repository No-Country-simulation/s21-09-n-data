import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
class Analytics:
    def __init__(self, database):
        self.db = database
    
    def get_total_sales(self, start_date, end_date):
        """Obtiene el total de ventas en un período de tiempo"""
        query = """
        SELECT COUNT(DISTINCT purchase_id) as total_sales
        FROM purchases
        WHERE date BETWEEN ? AND ?
        """
        result = self.db.execute_query(query, (start_date, end_date))
        return result['total_sales'][0] if not result.empty else 0
    
    def get_conversion_rate(self, start_date, end_date):
        """Calcula la tasa de conversión (compras / sesiones)"""
        # Contar sesiones totales
        sessions_query = """
        SELECT COUNT(DISTINCT session_id) as total_sessions
        FROM sessions
        WHERE date BETWEEN ? AND ?
        """
        sessions_result = self.db.execute_query(sessions_query, (start_date, end_date))
        total_sessions = sessions_result['total_sessions'][0] if not sessions_result.empty else 0
        
        # Contar sesiones que resultaron en compra
        purchases_query = """
        SELECT COUNT(DISTINCT session_id) as sessions_with_purchase
        FROM purchases
        WHERE date BETWEEN ? AND ?
        """
        purchases_result = self.db.execute_query(purchases_query, (start_date, end_date))
        sessions_with_purchase = purchases_result['sessions_with_purchase'][0] if not purchases_result.empty else 0
        
        # Calcular tasa de conversión
        if total_sessions > 0:
            return round((sessions_with_purchase / total_sessions) * 100, 2)
        else:
            return 0
    
    def get_top_products(self, start_date, end_date, limit=5):
        """Obtiene los productos más vendidos en un período"""
        query = """
        SELECT p.product_id, p.product_name, SUM(pd.quantity) as total_sold
        FROM purchase_details pd
        JOIN purchases pur ON pd.purchase_id = pur.purchase_id
        JOIN products p ON pd.product_id = p.product_id
        WHERE pur.date BETWEEN ? AND ?
        GROUP BY p.product_id, p.product_name
        ORDER BY total_sold DESC
        LIMIT ?
        """
        result = self.db.execute_query(query, (start_date, end_date, limit))
        return result.to_dict('records')
    
    def get_total_revenue(self, start_date, end_date):
        """Calcula el ingreso total en un período"""
        query = """
        SELECT SUM((p.price * (1 - p.discount) * (1 + p.tax)) * pd.quantity) as total_revenue
        FROM purchase_details pd
        JOIN purchases pur ON pd.purchase_id = pur.purchase_id
        JOIN products p ON pd.product_id = p.product_id
        WHERE pur.date BETWEEN ? AND ?
        """
        result = self.db.execute_query(query, (start_date, end_date))
        return round(result['total_revenue'][0], 2) if not result.empty and result['total_revenue'][0] is not None else 0
    
    def get_sales_trends(self, start_date, end_date, interval='day'):
        """Obtiene tendencias de ventas por intervalo (día, semana, mes)"""
        # Definir el formato de agrupación según el intervalo
        if interval == 'day':
            date_format = '%Y-%m-%d'
        elif interval == 'week':
            date_format = '%Y-%W'  # Año-Semana
        elif interval == 'month':
            date_format = '%Y-%m'  # Año-Mes
        else:
            date_format = '%Y-%m-%d'
        
        query = f"""
        SELECT 
            strftime('{date_format}', pur.date) as period,
            COUNT(DISTINCT pur.purchase_id) as num_sales,
            SUM((p.price * (1 - p.discount) * (1 + p.tax)) * pd.quantity) as revenue
        FROM purchases pur
        JOIN purchase_details pd ON pur.purchase_id = pd.purchase_id
        JOIN products p ON pd.product_id = p.product_id
        WHERE pur.date BETWEEN ? AND ?
        GROUP BY period
        ORDER BY period
        """
        
        result = self.db.execute_query(query, (start_date, end_date))
        
        # Formatear para ser compatible con gráficos de línea
        trends = {
            'labels': result['period'].tolist(),
            'sales': result['num_sales'].tolist(),
            'revenue': [round(rev, 2) for rev in result['revenue'].tolist()]
        }
        
        return trends
    
    def get_location_heatmap(self):
        """Obtiene datos para un mapa de calor de sesiones por ubicación"""
        query = """
        SELECT 
            c.location,
            COUNT(DISTINCT s.session_id) as session_count
        FROM sessions s
        JOIN customers c ON s.customer_id = c.customer_id
        GROUP BY c.location
        ORDER BY session_count DESC
        """
        
        result = self.db.execute_query(query)
        return result.to_dict('records')
    
    def get_cart_abandonment_analysis(self):
        """Analiza los abandonos de carrito"""
        # Tiempo promedio de abandono
        time_query = """
        SELECT 
            AVG(abandonment_time) as avg_abandonment_time,
            p.product_id,
            p.product_name
        FROM cart_abandonment ca
        JOIN products p ON ca.product_id = p.product_id
        GROUP BY p.product_id, p.product_name
        ORDER BY avg_abandonment_time DESC
        LIMIT 10
        """
        
        time_result = self.db.execute_query(time_query)
        
        # Productos más abandonados
        product_query = """
        SELECT 
            p.product_id,
            p.product_name,
            COUNT(*) as abandonment_count
        FROM cart_abandonment ca
        JOIN products p ON ca.product_id = p.product_id
        GROUP BY p.product_id, p.product_name
        ORDER BY abandonment_count DESC
        LIMIT 10
        """
        
        product_result = self.db.execute_query(product_query)
        
        return {
            'avg_time': time_result.to_dict('records'),
            'top_abandoned': product_result.to_dict('records')
        }
    
    def get_customer_demographics(self):
        """Obtiene datos demográficos de clientes y sus compras"""
        # Distribución por edad
        age_query = """
        SELECT 
            c.age_group,
            COUNT(DISTINCT pur.purchase_id) as purchase_count,
            SUM((p.price * (1 - p.discount) * (1 + p.tax)) * pd.quantity) as total_spent
        FROM purchases pur
        JOIN customers c ON pur.customer_id = c.customer_id
        JOIN purchase_details pd ON pur.purchase_id = pd.purchase_id
        JOIN products p ON pd.product_id = p.product_id
        GROUP BY c.age_group
        ORDER BY c.age_group
        """
        
        age_result = self.db.execute_query(age_query)
        
        # Distribución por género
        gender_query = """
        SELECT 
            c.gender,
            COUNT(DISTINCT pur.purchase_id) as purchase_count,
            SUM((p.price * (1 - p.discount) * (1 + p.tax)) * pd.quantity) as total_spent
        FROM purchases pur
        JOIN customers c ON pur.customer_id = c.customer_id
        JOIN purchase_details pd ON pur.purchase_id = pd.purchase_id
        JOIN products p ON pd.product_id = p.product_id
        GROUP BY c.gender
        ORDER BY c.gender
        """
        
        gender_result = self.db.execute_query(gender_query)
        
        # Distribución por ubicación
        location_query = """
        SELECT 
            c.location,
            COUNT(DISTINCT pur.purchase_id) as purchase_count,
            SUM((p.price * (1 - p.discount) * (1 + p.tax)) * pd.quantity) as total_spent
        FROM purchases pur
        JOIN customers c ON pur.customer_id = c.customer_id
        JOIN purchase_details pd ON pur.purchase_id = pd.purchase_id
        JOIN products p ON pd.product_id = p.product_id
        GROUP BY c.location
        ORDER BY purchase_count DESC
        """
        
        location_result = self.db.execute_query(location_query)
        
        return {
            'by_age': age_result.to_dict('records'),
            'by_gender': gender_result.to_dict('records'),
            'by_location': location_result.to_dict('records')
        }
    
    def get_purchase_patterns(self):
        """Analiza patrones de compra (productos comprados juntos, recurrencia)"""
        # Productos comprados juntos
        pairs_query = """
        SELECT 
            p1.product_id as product1_id,
            p1.product_name as product1_name,
            p2.product_id as product2_id,
            p2.product_name as product2_name,
            COUNT(*) as frequency
        FROM purchase_details pd1
        JOIN purchase_details pd2 ON pd1.purchase_id = pd2.purchase_id AND pd1.product_id < pd2.product_id
        JOIN products p1 ON pd1.product_id = p1.product_id
        JOIN products p2 ON pd2.product_id = p2.product_id
        GROUP BY product1_id, product1_name, product2_id, product2_name
        ORDER BY frequency DESC
        LIMIT 10
        """
        
        pairs_result = self.db.execute_query(pairs_query)
        
        # Clientes con compras recurrentes
        recurrent_query = """
        SELECT 
            c.customer_id,
            COUNT(DISTINCT pur.purchase_id) as purchase_count
        FROM purchases pur
        JOIN customers c ON pur.customer_id = c.customer_id
        GROUP BY c.customer_id
        HAVING purchase_count > 1
        ORDER BY purchase_count DESC
        LIMIT 10
        """
        
        recurrent_result = self.db.execute_query(recurrent_query)
        
        return {
            'product_pairs': pairs_result.to_dict('records'),
            'recurrent_customers': recurrent_result.to_dict('records')
        }
    
    def get_discount_impact(self, product_id=None):
        """Analiza el impacto de descuentos en las ventas"""
        # Base de la consulta
        base_query = """
        SELECT 
            CASE 
                WHEN p.discount = 0 THEN 'Sin descuento'
                WHEN p.discount <= 5 THEN '0-5%'
                WHEN p.discount <= 15 THEN '6-15%'
                WHEN p.discount <= 25 THEN '16-25%'
                ELSE 'Más de 30%'
            END as discount_range,
            COUNT(DISTINCT pd.purchase_id) as sales_count,
            SUM(pd.quantity) as units_sold,
            SUM((p.price * (1 - p.discount)) * pd.quantity) as revenue
        FROM purchase_details pd
        JOIN products p ON pd.product_id = p.product_id
        """
        
        # Añadir condición de producto si se proporciona
        if product_id:
            base_query += " WHERE p.product_id = ?"
            base_query += """
            GROUP BY discount_range
            ORDER BY CASE 
                WHEN discount_range = 'Sin descuento' THEN 1
                WHEN discount_range = '0-5%' THEN 2
                WHEN discount_range = '11-20%' THEN 3
                WHEN discount_range = '16-25%' THEN 4
                ELSE 5
            END
            """
            result = self.db.execute_query(base_query, (product_id,))
        else:
            base_query += """
            GROUP BY discount_range
            ORDER BY CASE 
                WHEN discount_range = 'Sin descuento' THEN 1
                WHEN discount_range = '0-5%' THEN 2
                WHEN discount_range = '11-20%' THEN 3
                WHEN discount_range = '16-25%' THEN 4
                ELSE 5
            END
            """
            result = self.db.execute_query(base_query)
        
        return result.to_dict('records')
    
    def generate_report(self, report_type, format_type='pdf', start_date=None, end_date=None):
        """Genera un reporte exportable"""
        # Esta es una implementación simplificada
        # En producción, aquí se generaría el reporte real en PDF o Excel
        
        if not os.path.exists('reports'):
            os.makedirs('reports')
        
        filename = f"{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format_type}"
        filepath = os.path.join('reports', filename)
        
        # Aquí iría la lógica real de generación de reportes
        # Por ahora, solo devolvemos el nombre del archivo
        
        return filename