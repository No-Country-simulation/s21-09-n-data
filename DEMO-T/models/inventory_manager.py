import pandas as pd
from datetime import datetime, timedelta

class InventoryManager:
    def __init__(self, database):
        self.db = database
        self.low_stock_threshold = 10  # Umbral para alertas de stock bajo
        
    def get_total_stock(self):
        """Obtiene el total de productos en inventario"""
        query = """
        SELECT SUM(stock_level) as total_stock
        FROM products
        """
        
        result = self.db.execute_query(query)
        return int(result['total_stock'][0]) if not result.empty else 0
    
    def get_stock(self, category=None):
        """Obtiene niveles de stock por producto, opcionalmente filtrado por categoría"""
        if category:
            query = """
            SELECT 
                product_id,
                product_name,
                category,
                stock_level,
                price,
                discount,
                supplier_id
            FROM products
            WHERE category = ?
            ORDER BY stock_level
            """
            
            result = self.db.execute_query(query, (category,))
        else:
            query = """
            SELECT 
                product_id,
                product_name,
                category,
                stock_level,
                price,
                discount,
                supplier_id
            FROM products
            ORDER BY category, stock_level
            """
            
            result = self.db.execute_query(query)
        
        # Añadir estado de stock (bajo, medio, alto)
        result['stock_status'] = result['stock_level'].apply(
            lambda x: 'Bajo' if x <= self.low_stock_threshold else 
                     ('Medio' if x <= 30 else 'Alto')
        )
        
        return result.to_dict('records')
    
    def get_low_stock_alerts(self):
        """Obtiene alertas de productos con stock bajo"""
        query = """
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            p.stock_level,
            s.name as supplier_name,
            s.contact as supplier_contact
        FROM products p
        JOIN suppliers s ON p.supplier_id = s.supplier_id
        WHERE p.stock_level <= ?
        ORDER BY p.stock_level
        """
        
        result = self.db.execute_query(query, (self.low_stock_threshold,))
        
        # Añadir días estimados hasta agotamiento basado en ventas recientes
        for i, row in result.iterrows():
            # Calcular tasa de ventas diaria en los últimos 30 días
            sales_query = """
            SELECT 
                SUM(pd.quantity) as quantity_sold
            FROM purchase_details pd
            JOIN purchases pur ON pd.purchase_id = pur.purchase_id
            WHERE pd.product_id = ?
            AND pur.date >= date('now', '-30 days')
            """
            
            sales_result = self.db.execute_query(sales_query, (row['product_id'],))
            quantity_sold = sales_result['quantity_sold'].iloc[0] if not sales_result.empty and sales_result['quantity_sold'].iloc[0] is not None else 0
            
            # Calcular tasa diaria
            daily_rate = quantity_sold / 30 if quantity_sold > 0 else 0.1  # Mínimo para evitar división por cero
            
            # Días hasta agotamiento
            days_until_depleted = int(row['stock_level'] / daily_rate) if daily_rate > 0 else 999
            
            # Añadir al dataframe
            result.at[i, 'days_until_depleted'] = days_until_depleted
            result.at[i, 'daily_sales_rate'] = round(daily_rate, 2)
        
        return result.to_dict('records')
    
    def get_supplier_performance(self, supplier_id=None):
        """Evalúa el rendimiento de proveedores"""
        # Base de la consulta
        base_query = """
        SELECT 
            s.supplier_id,
            s.name as supplier_name,
            s.performance_score,
            COUNT(DISTINCT p.product_id) as products_supplied,
            AVG(p.stock_level) as avg_stock_level
        FROM suppliers s
        LEFT JOIN products p ON s.supplier_id = p.supplier_id
        """
        
        # Filtrar por proveedor si se especifica
        if supplier_id:
            base_query += " WHERE s.supplier_id = ?"
            base_query += " GROUP BY s.supplier_id, s.name, s.performance_score"
            result = self.db.execute_query(base_query, (supplier_id,))
        else:
            base_query += " GROUP BY s.supplier_id, s.name, s.performance_score"
            base_query += " ORDER BY s.performance_score DESC"
            result = self.db.execute_query(base_query)
        
        # Calcular métricas adicionales (simuladas para la demo)
        for i, row in result.iterrows():
            # En un sistema real, estas métricas vendrían de datos históricos reales
            result.at[i, 'avg_delivery_time'] = round(5 - (row['performance_score'] - 3), 1)  # Días (invertido a score)
            result.at[i, 'on_time_delivery_rate'] = min(100, int(row['performance_score'] * 20))  # Porcentaje basado en score
            result.at[i, 'quality_issues'] = max(0, int(10 - row['performance_score'] * 2))  # Número absoluto de problemas
        
        return result.to_dict('records')
    
    def update_stock(self, product_id, new_stock):
        """Actualiza el nivel de stock de un producto"""
        query = """
        UPDATE products SET stock_level = ? WHERE product_id = ?
        """
        
        rows_affected = self.db.execute_update(query, (new_stock, product_id))
        
        if rows_affected == 0:
            return {'success': False, 'message': 'Producto no encontrado'}
            
        return {'success': True, 'message': 'Stock actualizado exitosamente', 'new_stock': new_stock}
    
    def create_restock_order(self, product_id, quantity):
        """Simula la creación de una orden de reabastecimiento"""
        # En un sistema real, esto crearía un registro en una tabla de órdenes de compra
        # Para la demo, simplemente devolvemos información del producto y la orden
        
        query = """
        SELECT 
            p.product_id,
            p.product_name,
            p.stock_level,
            s.supplier_id,
            s.name as supplier_name,
            s.contact as supplier_contact
        FROM products p
        JOIN suppliers s ON p.supplier_id = s.supplier_id
        WHERE p.product_id = ?
        """
        
        result = self.db.execute_query(query, (product_id,))
        
        if result.empty:
            return {'success': False, 'message': 'Producto no encontrado'}
        
        # Simular creación de orden
        order_id = f"ORD-{datetime.now().strftime('%Y%m%d')}-{product_id}"
        
        return {
            'success': True,
            'order_id': order_id,
            'product_id': product_id,
            'product_name': result['product_name'].iloc[0],
            'quantity': quantity,
            'supplier_id': result['supplier_id'].iloc[0],
            'supplier_name': result['supplier_name'].iloc[0],
            'estimated_arrival': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        }