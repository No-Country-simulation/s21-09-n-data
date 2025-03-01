from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from models.database import Database
from models.analytics import Analytics
from models.ml_models import MLModels
from models.user_manager import UserManager
from models.inventory_manager import InventoryManager
from models.sentiment_analyzer import SentimentAnalyzer

app = Flask(__name__)
CORS(app)  # Habilitar CORS para permitir peticiones desde el frontend

# Inicializar componentes principales
db = Database()
analytics = Analytics(db)
ml_models = MLModels(db)
user_manager = UserManager(db)
inventory_manager = InventoryManager(db)
sentiment_analyzer = SentimentAnalyzer(db)

# Rutas para el dashboard principal
@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    start_date = request.args.get('start_date', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
    
    summary = {
        'total_sales': analytics.get_total_sales(start_date, end_date),
        'conversion_rate': analytics.get_conversion_rate(start_date, end_date),
        'top_products': analytics.get_top_products(start_date, end_date, limit=5),
        'total_revenue': analytics.get_total_revenue(start_date, end_date),
        'available_stock': inventory_manager.get_total_stock()
    }
    
    return jsonify(summary)

@app.route('/api/dashboard/sales_trends', methods=['GET'])
def get_sales_trends():
    start_date = request.args.get('start_date', (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
    interval = request.args.get('interval', 'day')  # day, week, month
    
    trends = analytics.get_sales_trends(start_date, end_date, interval)
    return jsonify(trends)

@app.route('/api/dashboard/location_heatmap', methods=['GET'])
def get_location_heatmap():
    heatmap_data = analytics.get_location_heatmap()
    return jsonify(heatmap_data)

# Rutas para análisis de compras y comportamiento
@app.route('/api/customer/cart_abandonment', methods=['GET'])
def get_cart_abandonment():
    data = analytics.get_cart_abandonment_analysis()
    return jsonify(data)

@app.route('/api/customer/demographics', methods=['GET'])
def get_demographics():
    demographics = analytics.get_customer_demographics()
    return jsonify(demographics)

@app.route('/api/customer/purchase_patterns', methods=['GET'])
def get_purchase_patterns():
    patterns = analytics.get_purchase_patterns()
    return jsonify(patterns)

# Rutas para análisis de opiniones y reviews
@app.route('/api/reviews/sentiment', methods=['GET'])
def get_sentiment_analysis():
    product_id = request.args.get('product_id', None)
    category = request.args.get('category', None)
    
    sentiment = sentiment_analyzer.analyze_sentiment(product_id, category)
    return jsonify(sentiment)

@app.route('/api/reviews/topics', methods=['GET'])
def get_review_topics():
    topics = sentiment_analyzer.get_review_topics()
    return jsonify(topics)

@app.route('/api/reviews/scores', methods=['GET'])
def get_review_scores():
    scores = sentiment_analyzer.get_review_scores()
    return jsonify(scores)

# Rutas para machine learning
@app.route('/api/ml/customer_segments', methods=['GET'])
def get_customer_segments():
    segments = ml_models.get_customer_segments()
    return jsonify(segments)

@app.route('/api/ml/cart_abandonment_prediction', methods=['GET'])
def get_cart_abandonment_prediction():
    session_id = request.args.get('session_id')
    prediction = ml_models.predict_cart_abandonment(session_id)
    return jsonify(prediction)

@app.route('/api/ml/product_recommendations', methods=['GET'])
def get_product_recommendations():
    customer_id = request.args.get('customer_id')
    limit = int(request.args.get('limit', 5))
    
    recommendations = ml_models.get_product_recommendations(customer_id, limit)
    return jsonify(recommendations)

# Rutas para gestión de inventario
@app.route('/api/inventory/stock', methods=['GET'])
def get_inventory_stock():
    category = request.args.get('category', None)
    stock = inventory_manager.get_stock(category)
    return jsonify(stock)

@app.route('/api/inventory/alerts', methods=['GET'])
def get_inventory_alerts():
    alerts = inventory_manager.get_low_stock_alerts()
    return jsonify(alerts)

@app.route('/api/inventory/supplier_performance', methods=['GET'])
def get_supplier_performance():
    supplier_id = request.args.get('supplier_id', None)
    performance = inventory_manager.get_supplier_performance(supplier_id)
    return jsonify(performance)

@app.route('/api/inventory/discount_impact', methods=['GET'])
def get_discount_impact():
    product_id = request.args.get('product_id', None)
    impact = analytics.get_discount_impact(product_id)
    return jsonify(impact)

# Rutas para gestión de usuarios
@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json()
    result = user_manager.authenticate_user(data.get('username'), data.get('password'))
    return jsonify(result)

@app.route('/api/users/permissions', methods=['GET'])
def get_user_permissions():
    user_id = request.args.get('user_id')
    permissions = user_manager.get_user_permissions(user_id)
    return jsonify(permissions)

# Ruta para exportar reportes
@app.route('/api/reports/export', methods=['GET'])
def export_report():
    report_type = request.args.get('type')
    format_type = request.args.get('format', 'pdf')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    report_path = analytics.generate_report(report_type, format_type, start_date, end_date)
    return send_from_directory('reports', report_path)

# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True, port=5000)