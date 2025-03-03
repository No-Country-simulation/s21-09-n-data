from models.database import Database
from models.inventory_manager import InventoryManager

db = Database("database/ecommerce.db")  # Aquí creas la instancia de Database
inventory_manager = InventoryManager(db)  # Aquí pasas la instancia a inventory_manager

resultado = inventory_manager.get_total_stock()
print(resultado)

resultado2 = inventory_manager.get_stock()
print(resultado2)