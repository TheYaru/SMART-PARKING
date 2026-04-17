import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'parking.db')
# Guía 7 - Actividad 3:
# Variable global de configuración para definir la ruta de la base de datos.
# Ayuda a centralizar la configuración del sistema.
# Guía 5:
# Representa un dato base reutilizado en varias funciones del módulo.

def init_db():
    # Guía 7 - Actividad 1:
    # Subalgoritmo encargado únicamente de inicializar la base de datos.
    # Cumple con responsabilidad única: crear tablas y preparar datos iniciales.
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabla de espacios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS spaces (
            id INTEGER PRIMARY KEY,
            occupied BOOLEAN NOT NULL,
            plate TEXT,
            start_time INTEGER
        )
    ''')
    # Guía 5 - Actividad 2:
    # Estructuración de información del negocio en campos tipo clave:valor.
    # Cada fila de la tabla representa un objeto complejo del sistema:
    # id, occupied, plate, start_time.
    # Guía 6 - Actividad 1:
    # Esta tabla luego se consume como una colección lineal de espacios, es decir, un vector lógico.
    
    # Inicializar 10 espacios si no existen
    cursor.execute('SELECT COUNT(*) FROM spaces')
    if cursor.fetchone()[0] == 0:
        # Guía 7 - Actividad 1:
        # Regla de inicialización encapsulada dentro de la función.
        for i in range(1, 11):
            cursor.execute(
                'INSERT INTO spaces (id, occupied, plate, start_time) VALUES (?, ?, ?, ?)',
                (i, False, '', 0)
            )
            # Guía 5 - Actividad 1:
            # Uso de ciclo for para automatizar la creación repetitiva de registros.
            # Guía 5 - Actividad 2:
            # Inserción dinámica de datos del negocio en la estructura persistente.
            # Guía 6 - Actividad 1:
            # Se construye una colección lineal de 10 espacios del parqueadero.
    
    # Tabla de historial/ingresos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            revenue INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Guía 5 - Actividad 2:
    # Segunda estructura persistente para almacenar ingresos e historial temporal.
    # Guía 6 - Actividad 1:
    # Esta tabla soporta una serie de tiempo o colección de registros históricos.
    
    conn.commit()
    conn.close()
    # Guía 7 - Actividad 3:
    # Cierre ordenado del subalgoritmo después de completar su tarea.

def get_db_connection():
    # Guía 7 - Actividad 1:
    # Subalgoritmo dedicado exclusivamente a abrir y devolver una conexión reutilizable.
    # Esto mejora modularidad y reutilización del código.
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Guía 5 - Actividad 2:
    # Permite trabajar los resultados como estructuras accesibles por clave,
    # muy parecido al manejo de diccionarios.
    return conn
    # Guía 7 - Actividad 3:
    # Se prioriza el uso de retorno de función para reutilizar la conexión
    # sin dejar lógica suelta en otras partes del programa.