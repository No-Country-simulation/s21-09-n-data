from models.database import Database

# Instanciar la base de datos
db = Database()

# Cargar datos desde el CSV
db.load_data_from_csv('data/df_2.csv')

# Función para probar las consultas
def test_queries():
    print("\n🔍 Probando consultas en la base de datos...\n")

    # Probar si hay datos en la tabla
    query = "SELECT * FROM ecommerse LIMIT 5;"
    results = db.fetch_query(query)

    # Mostrar los primeros 5 resultados
    for row in results:
        print(row)

    # Contar registros en la tabla
    query_count = "SELECT COUNT(*) FROM ecommerse;"
    total_records = db.fetch_query(query_count)
    print(f"\n📊 Total de registros en la tabla: {total_records[0][0]}")

# Ejecutar pruebas
test_queries()
