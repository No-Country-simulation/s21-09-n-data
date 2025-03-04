from models.database import Database
from models.analytics import Analytics

db = Database("database/ecommerce.db")  # Aquí creas la instancia de Database
analytics = Analytics(db)  # Aquí pasas la instancia a Analytics

resultado = analytics.get_total_sales("2023-01-01", "2024-01-01")
print(resultado)

resultado2 = analytics.get_conversion_rate("2023-01-01", "2024-01-01")
print(resultado2)

resultado3 = analytics.get_min_date()
print(resultado3)
resultado4 = analytics.get_max_date()
print(resultado4)

'''
resultado = analytics.get_total_sales("2023-01-01", "2024-01-01")
print(resultado)

resultado2 = analytics.get_conversion_rate("2023-01-01", "2024-01-01")
print(resultado2)

resultado3 = analytics.get_top_products("2023-01-01", "2024-01-01")
print(resultado3)

resultado4 = analytics.get_total_revenue("2023-01-01", "2024-01-01")
print(resultado4)

resultado5 = analytics.get_sales_trends("2023-01-01", "2024-01-01")
print(resultado5)

resultado6 = analytics.get_location_heatmap()
print(resultado6)

resultado7 = analytics.get_cart_abandonment_analysis()
print(resultado7)

resultado8 = analytics.get_customer_demographics()
print(resultado8)

resultado9 = analytics.get_purchase_patterns()
print(resultado9)

resultado10 = analytics.get_discount_impact()
print(resultado10)

'''