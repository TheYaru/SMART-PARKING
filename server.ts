import express from "express"; // Guía 2: sintaxis base del programa y estructura inicial
import { createServer as createViteServer } from "vite"; // Configuración técnica del entorno
import path from "path"; // Manejo de rutas del sistema

async function startServer() {
  const app = express(); // Guía 2 - Actividad 2: variable principal del servidor
  const PORT = 3000; // Guía 2 - Actividad 2: variable numérica fija del sistema

  // Estado persistente del parqueadero
  let parkingState = {
    // Guía 2 - Actividad 3:
    // Lista base del sistema para almacenar los espacios del parqueadero
    // Guía 6 - Actividad 1:
    // Esta lista también puede justificarse como un vector centralizado de espacios
    spaces: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, // Guía 2 - Actividad 2: identificador numérico
      occupied: Math.random() > 0.7, // Guía 2 - Actividad 4: operador comparativo
      startTime: Date.now(), // Guía 2 - Actividad 2: almacenamiento de tiempo de inicio
      plate: "", // Guía 2 - Actividad 3: cadena inicial del sistema
    })),

    // Guía 2 - Actividad 4:
    // Variable acumuladora para ingresos
    totalRevenue: 0,

    // Guía 2 - Actividad 3:
    // Lista de historial para el gráfico
    // Guía 6 - Actividad 1:
    // Puede interpretarse como un vector de serie de tiempo
    hourlyHistory: Array.from({ length: 12 }, (_, i) => ({
      hour: `${i + 8}:00`, // Guía 2 - Actividad 3: uso de strings
      occupancy: Math.floor(Math.random() * 10), // Guía 2 - Actividad 4: operación aritmética
    })),

    // Guía 6 - Actividad 2:
    // Matriz del parqueadero organizada en filas y columnas
    // Sirve para representar la lógica espacial del sistema como estructura multidimensional
    parkingMatrix: [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
    ],
  };

  // Guía 6 - Actividad 3:
  // Validación de integridad de la matriz antes del procesamiento
  const isRectangularMatrix = (matrix) => {
    if (!Array.isArray(matrix) || matrix.length === 0) return false;
    const columns = matrix[0].length;
    return matrix.every((row) => Array.isArray(row) && row.length === columns);
  };

  if (!isRectangularMatrix(parkingState.parkingMatrix)) {
    throw new Error("La matriz del parqueadero no es rectangular");
  }

  // Guía 6 - Actividad 2:
  // Función para convertir la lista lineal de espacios en una matriz con detalle por celda
  const buildDetailedMatrix = (spaces, matrix) => {
    return matrix.map((row) =>
      row.map((spaceId) => {
        const space = spaces.find((s) => s.id === spaceId);
        return {
          id: space.id,
          occupied: space.occupied,
          plate: space.plate,
        };
      })
    );
  };

  // Motor de Simulación
  setInterval(() => {
    // Guía 5 - Actividad 1:
    // Uso de procesamiento iterativo sobre la colección de espacios
    parkingState.spaces = parkingState.spaces.map((space) => {
      // Guía 3 - Actividad 1:
      // Regla de negocio: si el espacio está libre, puede llegar un carro
      if (!space.occupied && Math.random() < 0.15) {
        return {
          ...space,
          occupied: true,
          startTime: Date.now(),
          plate: `ABC-${Math.floor(100 + Math.random() * 900)}`, // Guía 2 - Strings + operadores
        };
      }

      // Guía 3 - Actividad 1:
      // Regla de negocio: si el espacio está ocupado, puede salir un carro
      if (space.occupied && Math.random() < 0.10) {
        const durationHours = (Date.now() - space.startTime) / (1000 * 60 * 60);
        // Guía 2 - Actividad 4: cálculo aritmético

        parkingState.totalRevenue += Math.max(2000, Math.floor(durationHours * 5000));
        // Guía 3 - Actividad 1: aplicación de regla de cobro
        // Guía 2 - Actividad 4: operador acumulativo

        return { ...space, occupied: false, plate: "" };
      }

      return space;
    });

    const currentHour = new Date().getHours();
    const currentOccupancy = parkingState.spaces.filter((s) => s.occupied).length;
    // Guía 5 - Actividad 1:
    // recorrido implícito de colección mediante filter para procesar datos masivos
    // Guía 3 - Actividad 2:
    // lógica condicional aplicada al filtrado

    parkingState.hourlyHistory[parkingState.hourlyHistory.length - 1].occupancy = currentOccupancy;
    // Guía 4 - Actividad 3:
    // integración del flujo almacenamiento -> procesamiento -> salida

    // Guía 6 - Actividad 2:
    // actualización dinámica de la estructura matricial detallada
    parkingState.detailedMatrix = buildDetailedMatrix(
      parkingState.spaces,
      parkingState.parkingMatrix
    );

    // Guía 6 - Actividad 2 y 3:
    // recorrido matricial con ciclos anidados para cálculo global
    let occupiedInMatrix = 0;
    for (let i = 0; i < parkingState.detailedMatrix.length; i++) {
      for (let j = 0; j < parkingState.detailedMatrix[i].length; j++) {
        if (parkingState.detailedMatrix[i][j].occupied) {
          occupiedInMatrix++;
        }
      }
    }

    parkingState.matrixOccupancy = occupiedInMatrix;
  }, 3000);

  app.use(express.json());
  // Guía 4 - Actividad 1:
  // recepción de entrada en formato JSON

  app.get("/api/status", (req, res) => {
    const freeSpaces = parkingState.spaces.filter((s) => !s.occupied).length;
    // Guía 5 - Actividad 1:
    // procesamiento iterativo de colección
    // Guía 3 - Actividad 2:
    // condición lógica para contar espacios libres

    // Guía 5 - Actividad 2:
    // uso de estructura clave:valor en la respuesta JSON
    res.json({
      freeSpaces,
      totalSpaces: 10,
      spaces: parkingState.spaces,
      totalRevenue: parkingState.totalRevenue,
      history: parkingState.hourlyHistory,
      matrix: parkingState.detailedMatrix,
      matrixOccupancy: parkingState.matrixOccupancy || 0,
      timestamp: new Date().toISOString(),
    });
    // Guía 4 - Actividad 2:
    // salida formateada y estructurada del sistema
  });

  app.post("/api/pay", (req, res) => {
    const { spaceId } = req.body;
    // Guía 4 - Actividad 1:
    // entrada dinámica capturada desde el cliente

    const space = parkingState.spaces.find((s) => s.id === spaceId);
    // Guía 5 - Actividad 2:
    // búsqueda eficiente dentro de estructura con objetos clave:valor
    // Guía 5 - Actividad 1:
    // procesamiento sobre colección

    if (space && space.occupied) {
      // Guía 3 - Actividad 2:
      // validación lógica anidada del negocio
      space.occupied = false;
      space.plate = "";

      res.json({
        success: true,
        message: "Pago procesado exitosamente",
      });
      // Guía 4 - Actividad 2:
      // salida del resultado al usuario
    } else {
      res.status(400).json({
        success: false,
        message: "Espacio no ocupado o inválido",
      });
      // Guía 3 - Actividad 1:
      // caso alterno del flujo lógico
      // Guía 4 - Actividad 2:
      // salida de error
    }
  });

  // Guía 5 - Actividad 2:
  // Endpoint adicional para demostrar trabajo con diccionarios y búsqueda por clave
  app.get("/api/summary", (req, res) => {
    const occupiedSpaces = parkingState.spaces.filter((s) => s.occupied);
    const freeSpacesList = parkingState.spaces.filter((s) => !s.occupied);

    const summary = {
      totalSpaces: parkingState.spaces.length,
      occupiedCount: occupiedSpaces.length,
      freeCount: freeSpacesList.length,
      totalRevenue: parkingState.totalRevenue,
      occupiedPlates: occupiedSpaces.map((s) => s.plate).filter(Boolean),
    };

    res.json(summary);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Parking Pro Server running at http://localhost:${PORT}`);
    // Guía 4 - Actividad 2:
    // salida informativa final del servidor
  });
}

startServer();