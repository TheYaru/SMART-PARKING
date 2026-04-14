import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'parking.db')

def init_db():
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
    
    # Inicializar 10 espacios si no existen
    cursor.execute('SELECT COUNT(*) FROM spaces')
    if cursor.fetchone()[0] == 0:
        for i in range(1, 11):
            cursor.execute('INSERT INTO spaces (id, occupied, plate, start_time) VALUES (?, ?, ?, ?)',
                         (i, False, '', 0))
    
    # Tabla de historial/ingresos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            revenue INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
