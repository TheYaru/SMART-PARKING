import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Estado persistente del parqueadero
  let parkingState = {
    spaces: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      occupied: Math.random() > 0.7,
      startTime: Date.now(),
      plate: "",
    })),
    totalRevenue: 0,
    hourlyHistory: Array.from({ length: 12 }, (_, i) => ({
      hour: `${i + 8}:00`,
      occupancy: Math.floor(Math.random() * 10),
    })),
  };

  // Motor de Simulación: Los carros llegan y se van orgánicamente
  setInterval(() => {
    parkingState.spaces = parkingState.spaces.map((space) => {
      // Si está libre, hay un 15% de probabilidad de que llegue un carro
      if (!space.occupied && Math.random() < 0.15) {
        return { 
          ...space, 
          occupied: true, 
          startTime: Date.now(),
          plate: `ABC-${Math.floor(100 + Math.random() * 900)}` 
        };
      }
      // Si está ocupado, hay un 10% de probabilidad de que se vaya
      if (space.occupied && Math.random() < 0.10) {
        const durationHours = (Date.now() - space.startTime) / (1000 * 60 * 60);
        parkingState.totalRevenue += Math.max(2000, Math.floor(durationHours * 5000)); // Tarifa Ventura Plaza
        return { ...space, occupied: false, plate: "" };
      }
      return space;
    });

    // Actualizar historial para el gráfico
    const currentHour = new Date().getHours();
    const currentOccupancy = parkingState.spaces.filter(s => s.occupied).length;
    // Actualizamos el último punto del historial
    parkingState.hourlyHistory[parkingState.hourlyHistory.length - 1].occupancy = currentOccupancy;
  }, 3000);

  app.use(express.json());

  // Endpoints
  app.get("/api/status", (req, res) => {
    const freeSpaces = parkingState.spaces.filter((s) => !s.occupied).length;
    res.json({
      freeSpaces,
      totalSpaces: 10,
      spaces: parkingState.spaces,
      totalRevenue: parkingState.totalRevenue,
      history: parkingState.hourlyHistory,
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/pay", (req, res) => {
    const { spaceId } = req.body;
    const space = parkingState.spaces.find(s => s.id === spaceId);
    if (space && space.occupied) {
      space.occupied = false;
      space.plate = "";
      res.json({ success: true, message: "Pago procesado exitosamente" });
    } else {
      res.status(400).json({ success: false, message: "Espacio no ocupado o inválido" });
    }
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
  });
}

startServer();
