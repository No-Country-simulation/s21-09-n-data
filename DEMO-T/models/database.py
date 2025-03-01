import pandas as pd
import sqlite3
import os
from datetime import datetime

class Database:
    def __init__(self, db_path='database/ecommerce.db'):
        self.db_path = db_path
        self.ensure_db_exists()

        
    def ensure_db_exists(self):
        """Asegura que la base de datos y sus tablas existan"""
        if not os.path.exists(os.path.dirname(self.db_path)):
            os.makedirs(os.path.dirname(self.db_path))
        
        if not os.path.exists(self.db_path):
            self._create_database()
    
    def _create_database(self):
        """Crea las tablas necesarias en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        # Tabla de sesiones
        c.execute('''
        CREATE TABLE sessions (
            session_id TEXT PRIMARY KEY,
            date TEXT,
            HORA TEXT,
            device_id TEXT,
            device_type TEXT,
            os TEXT,
            date_id TEXT,
            customer_id TEXT
        )
        ''')
        
        # Tabla de productos
        c.execute('''
        CREATE TABLE products (
            date TEXT,
            product_id TEXT PRIMARY KEY,
            product_name TEXT,
            category TEXT,
            price REAL,
            discount REAL,
            tax REAL,
            stock_level INTEGER,
            supplier_id TEXT,
            seasonality TEXT,
            popularity INTEGER
        )
        ''')
        
        # Tabla de clientes
        c.execute('''
        CREATE TABLE customers (
            customer_id TEXT PRIMARY KEY,
            age INTEGER,
            age_group TEXT,
            location TEXT,
            gender TEXT
        )
        ''')
        
        # Tabla de compras
        c.execute('''
        CREATE TABLE purchases (
            purchase_id TEXT PRIMARY KEY,
            customer_id TEXT,
            session_id TEXT,
            date TEXT,
            HORA TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
            FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        )
        ''')
        
        # Tabla de detalles de compra
        c.execute('''
        CREATE TABLE purchase_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            purchase_id TEXT,
            product_id TEXT,
            quantity INTEGER,
            shipping_cost REAL,
            shipping_method TEXT,
            FOREIGN KEY (purchase_id) REFERENCES purchases (purchase_id),
            FOREIGN KEY (product_id) REFERENCES products (product_id)
        )
        ''')
        
        # Tabla de abandonos de carrito
        c.execute('''
        CREATE TABLE cart_abandonment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            product_id TEXT,
            quantity INTEGER,
            abandonment_time INTEGER,
            date TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id),
            FOREIGN KEY (product_id) REFERENCES products (product_id)
        )
        ''')
        
        # Tabla de proveedores
        c.execute('''
        CREATE TABLE suppliers (
            supplier_id TEXT PRIMARY KEY,
            name TEXT,
            contact TEXT,
            performance_score REAL
        )
        ''')
        
        # Tabla de reviews
        c.execute('''
        CREATE TABLE reviews (
            review_id TEXT PRIMARY KEY,
            product_id TEXT,
            customer_id TEXT,
            content TEXT,
            score INTEGER,
            thumbs_up_count INTEGER,
            at TEXT,
            FOREIGN KEY (product_id) REFERENCES products (product_id),
            FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
        )
        ''')
        
        # Tabla de respuestas a reviews
        c.execute('''
        CREATE TABLE review_replies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id TEXT,
            reply_content TEXT,
            at TEXT,
            FOREIGN KEY (review_id) REFERENCES reviews (review_id)
        )
        ''')
        
        # Tabla de usuarios del sistema
        c.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            last_login TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
    def load_data_from_csv(self, csv_path):
        """Carga datos desde un archivo CSV y los inserta en la base de datos"""
        conn = sqlite3.connect(self.db_path)

        # Leer el CSV con pandas
        df = pd.read_csv(csv_path, dtype={'date': 'string'}, low_memory=False)
        
        # Insertar los datos en la tabla 'ecommerse'
        df.to_sql('ecommerse', conn, if_exists='append', index=False)

        conn.commit()
        conn.close()
        print("✅ Datos de CSV cargados exitosamente en la base de datos.")

    def fetch_query(self, query):
        """Ejecuta una consulta en la base de datos y devuelve los resultados"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        return results    
    def _populate_sample_data(self):
        """Popula la base de datos con datos de muestra"""
        conn = sqlite3.connect(self.db_path)
        
        # Generar datos de muestra para cada tabla
        # Usuarios
        users_df = pd.DataFrame({
            'username': ['admin', 'analyst', 'manager'],
            'password': ['admin123', 'analyst123', 'manager123'],
            'role': ['admin', 'analyst', 'manager'],
            'last_login': [datetime.now().strftime('%Y-%m-%d %H:%M:%S') for _ in range(3)]
        })
        users_df.to_sql('users', conn, if_exists='append', index=False)
        
        # Datos de cliente, producto, sesiones, etc. (simplificados para el ejemplo)
        # En una implementación real, estos serían datos más extensos
        
        # Productos - 20 productos de muestra
        import numpy as np
        categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes']
        suppliers = ['SUPP001', 'SUPP002', 'SUPP003', 'SUPP004']
        seasonality = ['Verano', 'Invierno', 'Todo el año', 'Navidad']
        
        products = []
        for i in range(1, 21):
            product = {
                'product_id': f'PROD{i:03d}',
                'product_name': f'Producto {i}',
                'category': np.random.choice(categories),
                'price': round(np.random.uniform(10, 500), 2),
                'discount': round(np.random.uniform(0, 0.4), 2),
                'tax': 0.16,
                'stock_level': np.random.randint(0, 100),
                'supplier_id': np.random.choice(suppliers),
                'seasonality': np.random.choice(seasonality),
                'popularity': np.random.randint(1, 101)
            }
            products.append(product)
        
        products_df = pd.DataFrame(products)
        products_df.to_sql('products', conn, if_exists='append', index=False)
        
        # Clientes - 50 clientes de muestra
        locations = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 'Tijuana']
        genders = ['M', 'F', 'Otro']
        
        customers = []
        for i in range(1, 51):
            age = np.random.randint(18, 75)
            if age < 25:
                age_group = '18-24'
            elif age < 35:
                age_group = '25-34'
            elif age < 45:
                age_group = '35-44'
            elif age < 55:
                age_group = '45-54'
            else:
                age_group = '55+'
            
            customer = {
                'customer_id': f'CUST{i:03d}',
                'age': age,
                'age_group': age_group,
                'location': np.random.choice(locations),
                'gender': np.random.choice(genders)
            }
            customers.append(customer)
        
        customers_df = pd.DataFrame(customers)
        customers_df.to_sql('customers', conn, if_exists='append', index=False)
        
        # Proveedores
        suppliers_data = [
            {'supplier_id': 'SUPP001', 'name': 'Proveedor A', 'contact': 'contactoA@example.com', 'performance_score': 4.8},
            {'supplier_id': 'SUPP002', 'name': 'Proveedor B', 'contact': 'contactoB@example.com', 'performance_score': 4.2},
            {'supplier_id': 'SUPP003', 'name': 'Proveedor C', 'contact': 'contactoC@example.com', 'performance_score': 3.9},
            {'supplier_id': 'SUPP004', 'name': 'Proveedor D', 'contact': 'contactoD@example.com', 'performance_score': 4.5}
        ]
        suppliers_df = pd.DataFrame(suppliers_data)
        suppliers_df.to_sql('suppliers', conn, if_exists='append', index=False)
        
        # Generar sesiones, compras, abandonos y reviews
        # Esto es simplificado, en una implementación real habría más datos y relaciones
        
        conn.commit()
        conn.close()
        
        print("Base de datos creada y poblada con datos de muestra")
    
    def execute_query(self, query, params=None):
        """Ejecuta una consulta SQL y devuelve los resultados"""
        conn = sqlite3.connect(self.db_path)
        
        if params:
            result = pd.read_sql_query(query, conn, params=params)
        else:
            result = pd.read_sql_query(query, conn)
            
        conn.close()
        return result
    
    def execute_update(self, query, params=None):
        """Ejecuta una consulta de actualización (INSERT, UPDATE, DELETE)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        conn.commit()
        conn.close()
        return cursor.rowcount
    
    def get_dataframe(self, table_name, conditions=None):
        """Obtiene un DataFrame de una tabla con condiciones opcionales"""
        query = f"SELECT * FROM {table_name}"
        
        if conditions:
            query += f" WHERE {conditions}"
            
        return self.execute_query(query)