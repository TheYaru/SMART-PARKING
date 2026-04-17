from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
from database import init_db, get_db_connection

app = Flask(__name__)
CORS(app)

# Guía 7 - Actividad 3:
# Inicialización principal del sistema al arrancar el servidor.
# Se deja el flujo principal limpio, delegando la persistencia a la capa de base de datos.
init_db()

@app.route('/api/status', methods=['GET'])
def get_status():
    # Guía 7 - Actividad 1:
    # Subalgoritmo principal de consulta de estado del parqueadero.
    # Encapsula la lógica de lectura, simulación, actualización y respuesta.
    conn = get_db_connection()

    spaces = conn.execute('SELECT * FROM spaces').fetchall()
    # Guía 5 - Actividad 2:
    # Lectura de registros como estructura tipo clave:valor desde la base de datos.
    # Cada registro luego se convierte a diccionario para facilitar acceso por clave.

    # Simulación de flujo
    processed_spaces = []
    # Guía 5 - Actividad 1:
    # Lista para almacenar temporalmente los espacios procesados durante el ciclo for.
    # Se usa como colección intermedia para luego aplicar una transformación funcional.

    total_revenue_change = 0
    # Guía 5:
    # Variable acumuladora de ingresos generados durante esta iteración del sistema.

    for space in spaces:
        # Guía 5 - Actividad 1:
        # Uso de ciclo for para procesar masivamente cada espacio del parqueadero.
        # Esto cumple la parte de recorridos iterativos sobre colecciones.
        space_dict = dict(space)
        # Guía 5 - Actividad 2:
        # Conversión del registro a diccionario para trabajar con acceso por claves:
        # id, occupied, plate, start_time.

        if not space_dict['occupied'] and random.random() < 0.15:
            # Guía 7 - Actividad 1:
            # Regla de negocio encapsulada dentro del flujo principal:
            # si el espacio está libre, puede ser ocupado por un vehículo.
            space_dict['occupied'] = True
            space_dict['plate'] = f"PY-{random.randint(100, 999)}"
            # Guía 5 - Actividad 3:
            # Construcción dinámica de cadenas para generar la placa del vehículo.

            space_dict['start_time'] = int(time.time() * 1000)

            conn.execute(
                'UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
                (True, space_dict['plate'], space_dict['start_time'], space_dict['id'])
            )
            # Guía 5 - Actividad 2:
            # Actualización dinámica de la estructura persistente del sistema.

        elif space_dict['occupied'] and random.random() < 0.10:
            # Guía 7 - Actividad 1:
            # Segunda regla de negocio:
            # si el espacio está ocupado, existe probabilidad de que el vehículo salga.
            duration_ms = (time.time() * 1000) - space_dict['start_time']
            duration_hours = duration_ms / (1000 * 60 * 60)

            revenue = max(2000, int(duration_hours * 5000))
            total_revenue_change += revenue
            # Guía 5 - Actividad 1:
            # Procesamiento de cálculo dentro del recorrido iterativo.

            conn.execute(
                'UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
                (False, "", 0, space_dict['id'])
            )

            space_dict['occupied'] = False
            space_dict['plate'] = ""
            space_dict['start_time'] = 0

        processed_spaces.append(space_dict)
        # Guía 5 - Actividad 2:
        # Almacenamiento de cada elemento procesado en una lista de diccionarios.
        # Esto simula una base de datos temporal robusta en memoria.

    updated_spaces = list(map(
        lambda s: {
            "id": s["id"],
            "occupied": bool(s["occupied"]),
            "plate": s["plate"]
        },
        processed_spaces
    ))
    # Guía 7 - Actividad 2:
    # cambio a Lambda Function.
    # En lugar de construir updated_spaces manualmente con append dentro del for,
    # se aplica una lambda para transformar rápidamente la colección processed_spaces.
    # Esto mantiene exactamente la misma funcionalidad, pero con una refactorización funcional.
    # Guía 5:
    # También sigue siendo procesamiento iterativo de una colección.
    # Guía 7:
    # Cumple con el uso de lambda en transformación de datos, como pide la guía.

    if total_revenue_change > 0:
        conn.execute('INSERT INTO stats (revenue) VALUES (?)', (total_revenue_change,))
        # Guía 5 - Actividad 2:
        # Inserción dinámica de datos en la estructura de persistencia.

    conn.commit()

    # Calcular totales e historial
    free_spaces = len([s for s in updated_spaces if not s['occupied']])
    # Guía 5 - Actividad 1:
    # Procesamiento iterativo sobre colección para calcular espacios libres.
    # Se usa una comprensión de lista como técnica de recorrido.

    total_revenue = conn.execute('SELECT SUM(revenue) FROM stats').fetchone()[0] or 0

    # Mock de historial para el gráfico
    history = []
    # Guía 6 - Actividad 1:
    # Vector/lista unidimensional que almacena la serie de tiempo del sistema.

    current_hour = time.localtime().tm_hour

    for i in range(12):
        # Guía 5 - Actividad 1:
        # Recorrido iterativo para generar los 12 puntos del historial.
        hour_val = (current_hour - (11 - i)) % 24

        history.append({
            "hour": f"{hour_val}:00",
            "occupancy": random.randint(2, 8) if i < 11 else (10 - free_spaces)
        })
        # Guía 5 - Actividad 2:
        # Cada elemento del historial se modela como diccionario.
        # Guía 6 - Actividad 1:
        # El historial completo funciona como vector de datos temporales.

    conn.close()

    return jsonify({
        "freeSpaces": free_spaces,
        "totalSpaces": 10,
        "spaces": updated_spaces,
        "totalRevenue": total_revenue,
        "history": history,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    })
    # Guía 7 - Actividad 3:
    # El subalgoritmo retorna una salida completa y limpia, manteniendo el flujo modular.
    # Guía 5:
    # La respuesta final contiene listas y diccionarios organizados para el cliente.

@app.route('/api/pay', methods=['POST'])
def pay():
    # Guía 7 - Actividad 1:
    # Segundo subalgoritmo del sistema, dedicado exclusivamente al procesamiento de pagos.
    data = request.json
    space_id = data.get('spaceId')
    # Guía 5 - Actividad 2:
    # Captura de entrada a través de estructura clave:valor.

    conn = get_db_connection()
    space = conn.execute('SELECT * FROM spaces WHERE id = ?', (space_id,)).fetchone()

    if space and space['occupied']:
        conn.execute(
            'UPDATE spaces SET occupied = ?, plate = ?, start_time = ? WHERE id = ?',
            (False, "", 0, space_id)
        )
        conn.commit()
        conn.close()
        return jsonify({
            "success": True,
            "message": "Pago procesado en Python/SQLite"
        })
        # Guía 5 - Actividad 2:
        # Respuesta estructurada como diccionario/JSON.

    conn.close()
    return jsonify({
        "success": False,
        "message": "Espacio inválido"
    }), 400
    # Guía 7 - Actividad 1:
    # La función mantiene responsabilidad única: validar y procesar pago.

if __name__ == '__main__':
    # Guía 7 - Actividad 3:
    # Punto de entrada del programa.
    # Se conserva una arquitectura limpia basada en funciones/rutas definidas.
    app.run(host='0.0.0.0', port=5000)