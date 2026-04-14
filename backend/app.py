from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
from database import init_db, get_db_connection

app = Flask(__name__)
CORS(app)

# Inicializar DB al arrancar
init_db()

@app.route('/api/status', methods=['GET'])
def get_status():
    conn = get_db_connection()
    spaces = conn.execute('SELECT * FROM spaces').fetchall()
    
    # Simulación de flujo
    updated_spaces = []
    total_revenue_change = 0
    
    for space in spaces:
        space_dict = dict(space)
        if not space_dict['occupied'] and random.random() < 0.15:
            space_dict['occupied'] = True
            space_dict['plate'] = f"PY-{random.randint(100, 999)}"
            space_dict['start_time'] = int(time.time() * 1000)
            conn.execute('UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
                        (True, space_dict['plate'], space_dict['start_time'], space_dict['id']))
        elif space_dict['occupied'] and random.random() < 0.10:
            duration_ms = (time.time() * 1000) - space_dict['start_time']
            duration_hours = duration_ms / (1000 * 60 * 60)
            revenue = max(2000, int(duration_hours * 5000))
            total_revenue_change += revenue
            conn.execute('UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
                        (False, "", 0, space_dict['id']))
            space_dict['occupied'] = False
            
        updated_spaces.append({
            "id": space_dict['id'],
            "occupied": bool(space_dict['occupied']),
            "plate": space_dict['plate']
        })

    if total_revenue_change > 0:
        conn.execute('INSERT INTO stats (revenue) VALUES (?)', (total_revenue_change,))
    
    conn.commit()
    
    # Calcular totales e historial
    free_spaces = len([s for s in updated_spaces if not s['occupied']])
    total_revenue = conn.execute('SELECT SUM(revenue) FROM stats').fetchone()[0] or 0
    
    # Mock de historial para el gráfico (en un MVP real esto vendría de una tabla de logs)
    history = []
    current_hour = time.localtime().tm_hour
    for i in range(12):
        hour_val = (current_hour - (11 - i)) % 24
        history.append({
            "hour": f"{hour_val}:00",
            "occupancy": random.randint(2, 8) if i < 11 else (10 - free_spaces)
        })
    
    conn.close()
    
    return jsonify({
        "freeSpaces": free_spaces,
        "totalSpaces": 10,
        "spaces": updated_spaces,
        "totalRevenue": total_revenue,
        "history": history,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    })

@app.route('/api/pay', methods=['POST'])
def pay():
    data = request.json
    space_id = data.get('spaceId')
    
    conn = get_db_connection()
    space = conn.execute('SELECT * FROM spaces WHERE id = ?', (space_id,)).fetchone()
    
    if space and space['occupied']:
        conn.execute('UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
                    (False, "", 0, space_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Pago procesado en Python/SQLite"})
    
    conn.close()
    return jsonify({"success": False, "message": "Espacio inválido"}), 400

if __name__ == '__main__':
    # Correr en puerto 5000 internamente
    app.run(host='0.0.0.0', port=5000)
