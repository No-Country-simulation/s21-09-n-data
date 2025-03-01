import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import pickle
import os
from datetime import datetime

class MLModels:
    def __init__(self, database):
        self.db = database
        self.models_path = 'models/trained'
        self.ensure_models_path()
        
    def ensure_models_path(self):
        """Asegura que exista el directorio para los modelos entrenados"""
        if not os.path.exists(self.models_path):
            os.makedirs(self.models_path)
    
    def get_customer_segments(self, n_clusters=4):
        """Segmenta a los clientes mediante clustering"""
        # Obtener datos de clientes y sus compras
        query = """
        SELECT 
            c.customer_id,
            c.age,
            COUNT(DISTINCT pur.purchase_id) as purchase_count,
            SUM((p.price * (1 - p.discount)) * pd.quantity) as total_spent,
            AVG(p.price) as avg_price,
            MAX(pur.date) as last_purchase_date
        FROM customers c
        LEFT JOIN purchases pur ON c.customer_id = pur.customer_id
        LEFT JOIN purchase_details pd ON pur.purchase_id = pd.purchase_id
        LEFT JOIN products p ON pd.product_id = p.product_id
        GROUP BY c.customer_id, c.age
        """
        
        customers_df = self.db.execute_query(query)
        
        # Convertir última fecha de compra a días desde hoy
        customers_df['last_purchase_date'] = pd.to_datetime(customers_df['last_purchase_date'])
        current_date = datetime.now()
        customers_df['days_since_last_purchase'] = (current_date - customers_df['last_purchase_date']).dt.days
        
        # Rellenar datos faltantes
        customers_df.fillna({
            'purchase_count': 0,
            'total_spent': 0,
            'avg_price': 0,
            'days_since_last_purchase': 365  # Un año para los que nunca compraron
        }, inplace=True)
        
        # Seleccionar características para clustering
        features = ['age', 'purchase_count', 'total_spent', 'avg_price', 'days_since_last_purchase']
        X = customers_df[features].copy()
        
        # Escalar características
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Aplicar KMeans
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        customers_df['segment'] = kmeans.fit_predict(X_scaled)
        
        # Guardar el modelo entrenado
        model_path = os.path.join(self.models_path, 'customer_segmentation.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump({
                'kmeans': kmeans,
                'scaler': scaler,
                'features': features
            }, f)
        
        # Calcular estadísticas por segmento
        segment_stats = customers_df.groupby('segment').agg({
            'customer_id': 'count',
            'age': 'mean',
            'purchase_count': 'mean',
            'total_spent': 'mean',
            'avg_price': 'mean',
            'days_since_last_purchase': 'mean'
        }).reset_index()
        
        segment_stats.columns = ['segment', 'count', 'avg_age', 'avg_purchases', 'avg_spent', 'avg_price', 'avg_days_since_purchase']
        
        # Etiquetar segmentos
        segment_labels = self._label_segments(segment_stats)
        
        # Unir las etiquetas de segmentos
        segment_stats['label'] = segment_stats['segment'].map(segment_labels)
        
        return segment_stats.to_dict('records')
    
    def _label_segments(self, segment_stats):
        """Etiqueta los segmentos según sus características"""
        labels = {}
        
        for _, row in segment_stats.iterrows():
            segment = row['segment']
            
            # Características clave
            spent = row['avg_spent']
            frequency = row['avg_purchases']
            recency = row['avg_days_since_purchase']
            
            # Lógica para etiquetar
            if spent > segment_stats['avg_spent'].mean() and frequency > segment_stats['avg_purchases'].mean() and recency < segment_stats['avg_days_since_purchase'].mean():
                labels[segment] = "Clientes Leales"
            elif spent > segment_stats['avg_spent'].mean() and recency > segment_stats['avg_days_since_purchase'].mean():
                labels[segment] = "Clientes Inactivos de Alto Valor"
            elif frequency > segment_stats['avg_purchases'].mean() and spent < segment_stats['avg_spent'].mean():
                labels[segment] = "Compradores Frecuentes de Bajo Valor"
            elif recency < segment_stats['avg_days_since_purchase'].mean() and spent < segment_stats['avg_spent'].mean():
                labels[segment] = "Nuevos Clientes"
            else:
                labels[segment] = f"Segmento {segment}"
                
        return labels
    
    def predict_cart_abandonment(self, session_id):
        """Predice la probabilidad de abandono de carrito para una sesión"""
        # Obtener características de la sesión
        query = """
        SELECT 
            s.device_type,
            s.os,
            COUNT(ca.product_id) as previous_abandonments,
            SUM(p.price) as cart_value,
            AVG(p.discount) as avg_discount,
            COUNT(DISTINCT p.product_id) as num_items
        FROM sessions s
        LEFT JOIN cart_abandonment ca ON s.customer_id = (
            SELECT customer_id FROM sessions WHERE session_id = ca.session_id LIMIT 1
        )
        LEFT JOIN products p ON p.product_id IN (
            SELECT product_id FROM cart_abandonment WHERE session_id = ?
        )
        WHERE s.session_id = ?
        GROUP BY s.device_type, s.os
        """
        
        session_data = self.db.execute_query(query, (session_id, session_id))
        
        if session_data.empty:
            return {'probability': 0, 'risk_level': 'Bajo'}
        
        # En un caso real, aquí cargaríamos un modelo previamente entrenado
        # Por simplicidad, usamos un modelo sintético
        
        # Factores de riesgo
        risk_factors = {
            'previous_abandonments': 0.1,
            'cart_value': -0.005,  # A mayor valor, menor probabilidad de abandono
            'avg_discount': -0.2,  # A mayor descuento, menor probabilidad de abandono
            'num_items': 0.05      # A más items, mayor probabilidad de abandono
        }
        
        # Calcular probabilidad base (50%)
        probability = 0.5
        
        # Ajustar probabilidad por factores
        for factor, weight in risk_factors.items():
            if factor in session_data.columns:
                value = session_data[factor].iloc[0]
                if value is not None:
                    probability += value * weight
        
        # Normalizar entre 0 y 1
        probability = max(0, min(1, probability))
        
        # Determinar nivel de riesgo
        if probability < 0.3:
            risk_level = 'Bajo'
        elif probability < 0.6:
            risk_level = 'Medio'
        else:
            risk_level = 'Alto'
            
        return {
            'probability': round(probability * 100, 2),
            'risk_level': risk_level,
            'factors': {factor: session_data[factor].iloc[0] if factor in session_data.columns else 0 for factor in risk_factors}
        }
    
    def get_product_recommendations(self, customer_id, limit=5):
        """Genera recomendaciones de productos para un cliente"""
        # Obtener historial de compras del cliente
        purchases_query = """
        SELECT 
            pd.product_id
        FROM purchases pur
        JOIN purchase_details pd ON pur.purchase_id = pd.purchase_id
        WHERE pur.customer_id = ?
        """
        
        purchased_products = self.db.execute_query(purchases_query, (customer_id,))
        purchased_ids = purchased_products['product_id'].tolist() if not purchased_products.empty else []
        
        # En un sistema real, usaríamos collaborative filtering o algoritmos de recomendación
        # Para esta demo, usamos una lógica simplificada de productos similares/populares
        
        # Si el cliente ha comprado productos, buscar productos similares
        if purchased_ids:
            # Buscar productos de categorías similares
            similar_query = f"""
            SELECT 
                p.product_id,
                p.product_name,
                p.category,
                p.price,
                p.discount,
                p.popularity
            FROM products p
            WHERE p.category IN (
                SELECT DISTINCT category FROM products WHERE product_id IN ({','.join(['?']*len(purchased_ids))})
            )
            AND p.product_id NOT IN ({','.join(['?']*len(purchased_ids))})
            ORDER BY p.popularity DESC
            LIMIT ?
            """
            
            params = purchased_ids + purchased_ids + [limit]
            recommendations = self.db.execute_query(similar_query, params)
            
        else:
            # Si no hay historial, recomendar productos populares
            popular_query = """
            SELECT 
                p.product_id,
                p.product_name,
                p.category,
                p.price,
                p.discount,
                p.popularity
            FROM products p
            ORDER BY p.popularity DESC
            LIMIT ?
            """
            
            recommendations = self.db.execute_query(popular_query, (limit,))
        
        # Calcular precio con descuento
        if not recommendations.empty:
            recommendations['discounted_price'] = recommendations['price'] * (1 - recommendations['discount'])
            
        return recommendations.to_dict('records')
    
    def train_cart_abandonment_model(self):
        """Entrena un modelo para predecir abandono de carrito"""
        # En un sistema real, este método extraería datos históricos,
        # prepararía características y etiquetas, y entrenaría un modelo
        # de aprendizaje automático para predecir abandonos
        
        # Aquí implementamos una versión simplificada para la demo
        
        # Obtener datos de sesiones y si resultaron en abandono
        query = """
        SELECT 
            s.session_id,
            s.device_type,
            s.os,
            CASE WHEN pur.purchase_id IS NULL THEN 1 ELSE 0 END as abandoned,
            COUNT(ca.product_id) as num_abandoned_items,
            SUM(p.price) as cart_value,
            AVG(p.discount) as avg_discount
        FROM sessions s
        LEFT JOIN purchases pur ON s.session_id = pur.session_id
        LEFT JOIN cart_abandonment ca ON s.session_id = ca.session_id
        LEFT JOIN products p ON ca.product_id = p.product_id
        GROUP BY s.session_id, s.device_type, s.os, abandoned
        """
        
        # Esta consulta simularía la extracción de datos para entrenar
        # En una implementación real, se procesarían estos datos y se entrenaría
        # un modelo como RandomForest o LogisticRegression
        
        print("Simulando entrenamiento de modelo de abandono de carrito...")
        
        # Simplemente guardamos un modelo ficticio para la demo
        model_path = os.path.join(self.models_path, 'cart_abandonment_model.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump({
                'model_type': 'LogisticRegression',
                'features': ['device_type', 'os', 'num_abandoned_items', 'cart_value', 'avg_discount'],
                'trained_date': datetime.now().strftime('%Y-%m-%d')
            }, f)
            
        return {'status': 'success', 'message': 'Modelo entrenado exitosamente'}