from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
from database import init_db, get_db_connection

app = Flask(__name__)
CORS(app)

# Inicializar DB al arrancar
init_db()

# --- G7: Refactorización Modular (Subalgoritmos def con parámetros y retornos) ---

def normalizar_placa(placa_sucia: str) -> str:
    """G5: Normalización de Cadenas aplicando métodos de Strings."""
    if not placa_sucia:
        return ""
    # Limpieza: quitamos espacios, convertimos a mayúsculas y aseguramos formato
    return placa_sucia.strip().upper()

def procesar_simulacion_matricial(matriz_parqueadero: list) -> tuple:
    """
    G6: Algoritmos de Acceso con doble indexación y ciclos anidados.
    G6: Modelado Matricial (listas anidadas).
    """
    # G6: Validación de Datos (Integridad de dimensiones)
    if not matriz_parqueadero or len(matriz_parqueadero) != 2:
        return matriz_parqueadero, 0

    ingresos_sesion = 0
    
    # G6: Ciclos anidados para recorrer la arquitectura central (Matriz)
    for f in range(len(matriz_parqueadero)): # Filas
        for c in range(len(matriz_parqueadero[f])): # Columnas (Doble Indexación)
            espacio = matriz_parqueadero[f][c]
            
            # Lógica de probabilidad de ocupación
            if not espacio['occupied'] and random.random() < 0.12:
                placa_generada = f"VP-{random.randint(100, 999)}"
                # G5: Aplicación de limpieza en tiempo real dentro del ciclo
                espacio['plate'] = normalizar_placa(placa_generada)
                espacio['occupied'] = True
                espacio['start_time'] = int(time.time() * 1000)
                
            # Probabilidad de salida
            elif espacio['occupied'] and random.random() < 0.08:
                duracion_ms = (time.time() * 1000) - espacio['start_time']
                ingresos_sesion += max(2000, int((duracion_ms / 3600000) * 5000))
                espacio['occupied'] = False
                espacio['plate'] = ""
                espacio['start_time'] = 0
                
    return matriz_parqueadero, ingresos_sesion

@app.route('/api/status', methods=['GET'])
def get_status():
    """G7: Orquestación de Software (Función principal de coordinación)."""
    conn = get_db_connection()
    # G6: Estructuras de Arreglos (Vectores) para traer datos de la DB
    raw_spaces = conn.execute('SELECT * FROM spaces ORDER BY id ASC').fetchall()
    
    # --- G6: Construcción de la Arquitectura Central (Matriz 2x5) ---
    # Convertimos el vector plano de la DB en una Matriz para cumplir con G6
    parqueadero_matriz = [
        [dict(raw_spaces[i]) for i in range(0, 5)], # Fila 1
        [dict(raw_spaces[i]) for i in range(5, 10)] # Fila 2
    ]
    
    # G5: Procesamiento Iterativo para simulación
    parqueadero_procesado, nuevos_ingresos = procesar_simulacion_matricial(parqueadero_matriz)
    
    # Actualizar DB con lo procesado en la matriz usando doble indexación
    for fila in parqueadero_procesado:
        for esp in fila:
            conn.execute('UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
                        (esp['occupied'], esp['plate'], esp['start_time'], esp['id']))
    
    if nuevos_ingresos > 0:
        conn.execute('INSERT INTO stats (revenue) VALUES (?)', (nuevos_ingresos,))
    
    conn.commit()
    
    # G7: Implementación Lambda (Optimización de procesos lógicos)
    # Aplanamos la matriz para el frontend usando una función lambda de conveniencia
    all_spaces = [item for sublist in parqueadero_procesado for item in sublist]
    libres_lambda = list(filter(lambda x: not x['occupied'], all_spaces))
    
    total_revenue = conn.execute('SELECT SUM(revenue) FROM stats').fetchone()[0] or 0
    
    # Mock de historial (G6: Manejo de series históricas)
    history = []
    curr_h = time.localtime().tm_hour
    for i in range(12):
        history.append({"hour": f"{(curr_h - (11-i))%24}:00", "occupancy": random.randint(3, 9)})

    conn.close()
    
    return jsonify({
        "freeSpaces": len(libres_lambda),
        "totalSpaces": 10,
        "spaces": all_spaces,
        "totalRevenue": total_revenue,
        "history": history,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    })

@app.route('/api/pay', methods=['POST'])
def pay():
    data = request.json
    space_id = data.get('spaceId')
    
    # G6: Validación de Datos antes de procesar
    if not isinstance(space_id, int):
        return jsonify({"success": False, "message": "ID Erróneo"}), 400

    conn = get_db_connection()
    conn.execute('UPDATE spaces SET occupied = 0, plate = "", start_time = 0 WHERE id = ?', (space_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Pago procesado y datos normalizados"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
