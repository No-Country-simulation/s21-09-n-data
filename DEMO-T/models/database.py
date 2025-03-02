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
        """Popula la base de datos con datos de muestra solo para la tabla users"""
        conn = sqlite3.connect(self.db_path)
            
        # Generar datos de muestra para la tabla users
        users_df = pd.DataFrame({
            'username': ['admin', 'analyst', 'manager'],
            'password': ['admin123', 'analyst123', 'manager123'],
            'role': ['admin', 'analyst', 'manager'],
            'last_login': [datetime.now().strftime('%Y-%m-%d %H:%M:%S') for _ in range(3)]
        })
        
        users_df.to_sql('users', conn, if_exists='append', index=False)
                       
        conn.commit()
        conn.close()
        print("✅ Datos de usuarios cargados exitosamente.")
            
    def populate_tables_from_ecommerce(self):
        """Popula las tablas con datos de la tabla 'ecommerse'."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Verificar si la tabla ecommerse existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ecommerse';")
        if not cursor.fetchone():
            print("❌ La tabla 'ecommerse' no existe. No se pueden poblar las demás tablas.")
            conn.close()
            return
        
        # Cargar datos de la tabla ecommerse en un DataFrame
        ecom_df = pd.read_sql_query("SELECT * FROM ecommerse", conn)
        
        try:
            # Poblar la tabla sessions (asegurando que no haya duplicados por session_id)
            sessions_df = ecom_df[['session_id', 'date', 'HORA', 'device_id', 'device_type', 'os', 'date_id', 'Customer ID']].drop_duplicates(subset=['session_id'])
            sessions_df.columns = ['session_id', 'date', 'HORA', 'device_id', 'device_type', 'os', 'date_id', 'customer_id']
            sessions_df.to_sql('sessions', conn, if_exists='replace', index=False)
            
            # Poblar la tabla products (asegurando que no haya duplicados por product_id)
            products_df = ecom_df[['date', 'Product ID', 'Product Name', 'Category', 'Price', 'Discount', 'Tax', 'Stock Level', 'Supplier ID', 'Seasonality', 'Popularity']].drop_duplicates(subset=['Product ID'])
            products_df.columns = ['date', 'product_id', 'product_name', 'category', 'price', 'discount', 'tax', 'stock_level', 'supplier_id', 'seasonality', 'popularity']
            products_df.to_sql('products', conn, if_exists='replace', index=False)
            
            # Poblar la tabla customers (asegurando que no haya duplicados por customer_id)
            customers_df = ecom_df[['Customer ID', 'Age', 'Age Group', 'Location', 'gender']].drop_duplicates(subset=['Customer ID'])
            customers_df.columns = ['customer_id', 'age', 'age_group', 'location', 'gender']
            customers_df.to_sql('customers', conn, if_exists='replace', index=False)
            
            # Poblar la tabla purchases (asegurando que no haya duplicados por purchase_id)
            purchases_df = ecom_df[['Id_compra', 'Customer ID', 'session_id', 'date', 'HORA']].drop_duplicates(subset=['Id_compra'])
            purchases_df.columns = ['purchase_id', 'customer_id', 'session_id', 'date', 'HORA']
            purchases_df.to_sql('purchases', conn, if_exists='replace', index=False)
            
            # Para tablas con claves foráneas pero sin clave primaria única en el modelo, usamos 'append'
            # Poblar la tabla purchase_details
            purchase_details_df = ecom_df[['Id_compra', 'Product ID', 'quantity', 'Shipping Cost', 'Shipping Method']]
            purchase_details_df.columns = ['purchase_id', 'product_id', 'quantity', 'shipping_cost', 'shipping_method']
            purchase_details_df.to_sql('purchase_details', conn, if_exists='replace', index=False)
            
            # Poblar la tabla cart_abandonment
            cart_abandonment_df = ecom_df[['session_id', 'Product ID', 'quantity', 'abandonment_time', 'date']]
            cart_abandonment_df.columns = ['session_id', 'product_id', 'quantity', 'abandonment_time', 'date']
            cart_abandonment_df.to_sql('cart_abandonment', conn, if_exists='replace', index=False)
            
            # Poblar la tabla suppliers (asegurando que no haya duplicados por supplier_id)
            suppliers_df = ecom_df[['Supplier ID']].drop_duplicates()
            suppliers_df.columns = ['supplier_id']
            suppliers_df.to_sql('suppliers', conn, if_exists='replace', index=False)
            
            # Poblar la tabla reviews (asegurando que no haya duplicados por review_id)
            reviews_df = ecom_df[['reviewId', 'Product ID', 'Customer ID', 'content', 'score', 'thumbsUpCount', 'at']].drop_duplicates(subset=['reviewId'])
            reviews_df.columns = ['review_id', 'product_id', 'customer_id', 'content', 'score', 'thumbs_up_count', 'at']
            reviews_df.to_sql('reviews', conn, if_exists='replace', index=False)
            
            # Poblar la tabla review_replies
            review_replies_df = ecom_df[['reviewId', 'replyContent', 'at']]
            review_replies_df.columns = ['review_id', 'reply_content', 'at']
            review_replies_df.to_sql('review_replies', conn, if_exists='replace', index=False)
            
            print("✅ Datos insertados correctamente en las tablas correspondientes.")
        except Exception as e:
            print(f"❌ Error al poblar las tablas: {str(e)}")
        finally:
            conn.commit()
            conn.close()
    
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