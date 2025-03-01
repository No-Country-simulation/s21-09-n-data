import pandas as pd
import hashlib
import uuid
from datetime import datetime

class UserManager:
    def __init__(self, database):
        self.db = database
        
    def authenticate_user(self, username, password):
        """Autentica a un usuario con su nombre de usuario y contraseña"""
        # En producción, usaríamos hash + salt para contraseñas
        query = """
        SELECT id, username, role, last_login
        FROM users
        WHERE username = ? AND password = ?
        """
        
        # En producción, jamás pasaríamos la contraseña en texto plano
        result = self.db.execute_query(query, (username, password))
        
        if result.empty:
            return {'success': False, 'message': 'Credenciales inválidas'}
        
        # Actualizar último acceso
        update_query = """
        UPDATE users SET last_login = ? WHERE id = ?
        """
        
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.db.execute_update(update_query, (now, result['id'].iloc[0]))
        
        # Generar token de sesión (simplificado)
        session_token = str(uuid.uuid4())
        
        return {
            'success': True,
            'user_id': int(result['id'].iloc[0]),
            'username': result['username'].iloc[0],
            'role': result['role'].iloc[0],
            'token': session_token
        }
    
    def get_user_permissions(self, user_id):
        """Obtiene los permisos de un usuario según su rol"""
        query = """
        SELECT role FROM users WHERE id = ?
        """
        
        result = self.db.execute_query(query, (user_id,))
        
        if result.empty:
            return {'error': 'Usuario no encontrado'}
        
        role = result['role'].iloc[0]
        
        # Definir permisos por rol
        permissions = {
            'admin': {
                'dashboard': True,
                'customer_analysis': True,
                'reviews': True,
                'ml': True,
                'inventory': True,
                'settings': True,
                'reports': True,
                'user_management': True
            },
            'analyst': {
                'dashboard': True,
                'customer_analysis': True,
                'reviews': True,
                'ml': True,
                'inventory': True,
                'settings': False,
                'reports': True,
                'user_management': False
            },
            'manager': {
                'dashboard': True,
                'customer_analysis': True,
                'reviews': True,
                'ml': False,
                'inventory': True,
                'settings': False,
                'reports': True,
                'user_management': False
            }
        }
        
        return permissions.get(role, {'dashboard': True})  # Permisos mínimos por defecto
    
    def create_user(self, username, password, role):
        """Crea un nuevo usuario"""
        # Verificar si el usuario ya existe
        check_query = """
        SELECT id FROM users WHERE username = ?
        """
        
        result = self.db.execute_query(check_query, (username,))
        
        if not result.empty:
            return {'success': False, 'message': 'El nombre de usuario ya existe'}
        
        # En producción, almacenaríamos la contraseña con hash + salt
        insert_query = """
        INSERT INTO users (username, password, role, last_login)
        VALUES (?, ?, ?, ?)
        """
        
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.db.execute_update(insert_query, (username, password, role, now))
        
        return {'success': True, 'message': 'Usuario creado exitosamente'}
    
    def update_user(self, user_id, updates):
        """Actualiza datos de un usuario"""
        # Verificar que el usuario existe
        check_query = """
        SELECT id FROM users WHERE id = ?
        """
        
        result = self.db.execute_query(check_query, (user_id,))
        
        if result.empty:
            return {'success': False, 'message': 'Usuario no encontrado'}
        
        # Construir query de actualización
        update_parts = []
        params = []
        
        if 'username' in updates:
            update_parts.append("username = ?")
            params.append(updates['username'])
            
        if 'password' in updates:
            update_parts.append("password = ?")
            params.append(updates['password'])
            
        if 'role' in updates:
            update_parts.append("role = ?")
            params.append(updates['role'])
        
        if not update_parts:
            return {'success': False, 'message': 'No se proporcionaron campos para actualizar'}
        
        update_query = f"""
        UPDATE users SET {', '.join(update_parts)} WHERE id = ?
        """
        
        params.append(user_id)
        self.db.execute_update(update_query, params)
        
        return {'success': True, 'message': 'Usuario actualizado exitosamente'}
    
    def delete_user(self, user_id):
        """Elimina un usuario"""
        query = """
        DELETE FROM users WHERE id = ?
        """
        
        rows_affected = self.db.execute_update(query, (user_id,))
        
        if rows_affected == 0:
            return {'success': False, 'message': 'Usuario no encontrado'}
            
        return {'success': True, 'message': 'Usuario eliminado exitosamente'}
    
    def get_all_users(self):
        """Obtiene lista de todos los usuarios (sin contraseñas)"""
        query = """
        SELECT id, username, role, last_login FROM users
        """
        
        result = self.db.execute_query(query)
        return result.to_dict('records')