import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import re
from datetime import datetime

class SentimentAnalyzer:
    def __init__(self, database):
        self.db = database
        
    def analyze_sentiment(self, product_id=None, category=None):
        """Analiza el sentimiento de las reviews, opcionalmente filtrado por producto o categoría"""
        # Base de la consulta
        base_query = """
        SELECT 
            r.review_id,
            r.content,
            r.score,
            p.product_id,
            p.product_name,
            p.category
        FROM reviews r
        JOIN products p ON r.product_id = p.product_id
        """
        
        # Aplicar filtros
        conditions = []
        params = []
        
        if product_id:
            conditions.append("p.product_id = ?")
            params.append(product_id)
            
        if category:
            conditions.append("p.category = ?")
            params.append(category)
            
        if conditions:
            base_query += f" WHERE {' AND '.join(conditions)}"
            
        reviews = self.db.execute_query(base_query, params if params else None)
        
        if reviews.empty:
            return {
                'sentiment_distribution': [],
                'sentiment_over_time': [],
                'average_score': 0,
                'review_count': 0
            }
        
        # Determinar sentimiento basado en puntaje
        reviews['sentiment'] = reviews['score'].apply(
            lambda x: 'Positivo' if x >= 4 else ('Neutral' if x >= 3 else 'Negativo')
        )
        
        # Distribución de sentimiento
        sentiment_counts = reviews['sentiment'].value_counts().reset_index()
        sentiment_counts.columns = ['sentiment', 'count']
        
        # Media de puntaje
        average_score = reviews['score'].mean()
        
        # Contar reviews
        review_count = len(reviews)
        
        # Simulamos evolución del sentimiento a lo largo del tiempo
        # En un sistema real, esto vendría de fechas reales en las reviews
        
        # Generar fechas simuladas para el ejemplo
        dates = [datetime.now() - pd.Timedelta(days=i) for i in range(30, 0, -1)]
        sentiment_by_date = []
        
        for date in dates:
            date_str = date.strftime('%Y-%m-%d')
            # Generar valores aleatorios pero con tendencias según el sentimiento general
            sentiment_by_date.append({
                'date': date_str,
                'Positivo': int(np.random.normal(
                    30 if average_score >= 4 else 15, 5
                )),
                'Neutral': int(np.random.normal(
                    30 if 3 <= average_score < 4 else 15, 5
                )),
                'Negativo': int(np.random.normal(
                    30 if average_score < 3 else 15, 5
                ))
            })
        
        return {
            'sentiment_distribution': sentiment_counts.to_dict('records'),
            'sentiment_over_time': sentiment_by_date,
            'average_score': round(average_score, 2),
            'review_count': review_count
        }
    
    def get_review_topics(self):
        """Extrae temas mencionados en las reviews usando LDA"""
        # Obtener todas las reviews
        query = """
        SELECT review_id, content, score FROM reviews
        """
        
        reviews = self.db.execute_query(query)
        
        if reviews.empty:
            return {'topics': [], 'topic_distribution': []}
        
        # Pre-procesar el texto
        reviews['processed_content'] = reviews['content'].apply(
            lambda x: re.sub(r'[^\w\s]', '', str(x).lower())
        )
        
        # Vectorizar el texto
        vectorizer = CountVectorizer(
            max_df=0.95, min_df=2, stop_words='english', max_features=100
        )
        dtm = vectorizer.fit_transform(reviews['processed_content'])
        
        # Aplicar LDA
        lda = LatentDirichletAllocation(
            n_components=5, random_state=42
        )
        lda.fit(dtm)
        
        # Obtener palabras principales para cada tema
        feature_names = vectorizer.get_feature_names_out()
        topics = []
        
        for topic_idx, topic in enumerate(lda.components_):
            top_words_idx = topic.argsort()[:-11:-1]  # Top 10 palabras
            top_words = [feature_names[i] for i in top_words_idx]
            
            topics.append({
                'topic_id': topic_idx,
                'name': f"Tema {topic_idx + 1}",
                'keywords': top_words,
                'size': int(np.sum(lda.components_[topic_idx]))
            })
        
        # Predecir tema para cada review
        topic_predictions = lda.transform(dtm)
        reviews['dominant_topic'] = topic_predictions.argmax(axis=1)
        
        # Distribución de temas
        topic_dist = reviews['dominant_topic'].value_counts().reset_index()
        topic_dist.columns = ['topic_id', 'count']
        
        # Añadir nombres de temas a la distribución
        topic_dist['name'] = topic_dist['topic_id'].apply(lambda x: f"Tema {x + 1}")
        
        # Distribución de sentimiento por tema
        sentiment_by_topic = []
        for topic_id in range(5):
            topic_reviews = reviews[reviews['dominant_topic'] == topic_id]
            if not topic_reviews.empty:
                avg_score = topic_reviews['score'].mean()
                sentiment_by_topic.append({
                    'topic_id': topic_id,
                    'name': f"Tema {topic_id + 1}",
                    'average_score': round(avg_score, 2),
                    'review_count': len(topic_reviews)
                })
        
        return {
            'topics': topics,
            'topic_distribution': topic_dist.to_dict('records'),
            'sentiment_by_topic': sentiment_by_topic
        }
    
    def get_review_scores(self):
        """Obtiene estadísticas de puntajes de reviews por producto y categoría"""
        query = """
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            COUNT(r.review_id) as review_count,
            AVG(r.score) as average_score,
            MIN(r.score) as min_score,
            MAX(r.score) as max_score
        FROM products p
        LEFT JOIN reviews r ON p.product_id = r.product_id
        GROUP BY p.product_id, p.product_name, p.category
        HAVING COUNT(r.review_id) > 0
        ORDER BY average_score DESC
        """
        
        scores_by_product = self.db.execute_query(query)
        
        if scores_by_product.empty:
            return {
                'scores_by_product': [],
                'scores_by_category': [],
                'score_distribution': []
            }
        
        # Formatear resultados por producto
        scores_by_product = scores_by_product.round({'average_score': 2})
        
        # Calcular por categoría
        scores_by_category = scores_by_product.groupby('category').agg({
            'review_count': 'sum',
            'average_score': 'mean'
        }).reset_index().round({'average_score': 2})
        
        # Distribución de puntajes
        query_dist = """
        SELECT 
            r.score,
            COUNT(*) as count
        FROM reviews r
        GROUP BY r.score
        ORDER BY r.score
        """
        
        score_distribution = self.db.execute_query(query_dist)
        
        return {
            'scores_by_product': scores_by_product.to_dict('records'),
            'scores_by_category': scores_by_category.to_dict('records'),
            'score_distribution': score_distribution.to_dict('records')
        }
    
    def get_review_response_impact(self):
        """Analiza el impacto de las respuestas a las reviews negativas"""
        query = """
        SELECT 
            r.review_id,
            r.score as initial_score,
            r.content,
            r.thumbsUpCount,
            r.at as review_date,
            r.replyContent,
            CASE WHEN r.replyContent IS NOT NULL THEN 1 ELSE 0 END as has_reply
        FROM reviews r
        WHERE r.score <= 3  -- Enfocado en reviews negativas/neutrales
        """
        
        reviews = self.db.execute_query(query)
        
        if reviews.empty:
            return {
                'response_impact': {},
                'response_rate': 0,
                'avg_improvement': 0
            }
        
        # Calcular tasa de respuesta
        total_negative = len(reviews)
        total_responded = reviews['has_reply'].sum()
        response_rate = round((total_responded / total_negative) * 100, 2) if total_negative > 0 else 0
        
        # Simular mejora en puntuación después de respuesta
        # En un sistema real, esto vendría de datos reales de seguimiento
        reviews['improvement'] = reviews.apply(
            lambda x: np.random.uniform(0.5, 2.0) if x['has_reply'] == 1 else 0, 
            axis=1
        )
        
        avg_improvement = reviews[reviews['has_reply'] == 1]['improvement'].mean()
        
        # Impacto en me gusta (thumbs up)
        avg_thumbs_with_reply = reviews[reviews['has_reply'] == 1]['thumbsUpCount'].mean()
        avg_thumbs_without_reply = reviews[reviews['has_reply'] == 0]['thumbsUpCount'].mean()
        
        impact = {
            'response_rate': response_rate,
            'avg_improvement': round(avg_improvement, 2) if not pd.isna(avg_improvement) else 0,
            'avg_thumbs_with_reply': round(avg_thumbs_with_reply, 2) if not pd.isna(avg_thumbs_with_reply) else 0,
            'avg_thumbs_without_reply': round(avg_thumbs_without_reply, 2) if not pd.isna(avg_thumbs_without_reply) else 0,
            'total_negative_reviews': total_negative,
            'total_responded': total_responded
        }
        
        return {
            'response_impact': impact
        }