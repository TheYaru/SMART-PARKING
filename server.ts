import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simulación de 10 sensores IoT
  const getParkingStatus = () => {
    const spaces = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      occupied: Math.random() > 0.5, // Simulación aleatoria
    }));

    const freeSpaces = spaces.filter((s) => !s.occupied).length;

    return {
      freeSpaces,
      totalSpaces: 10,
      spaces,
      timestamp: new Date().toISOString(),
    };
  };

  // Endpoint REST /status
  app.get("/api/status", (req, res) => {
    res.json(getParkingStatus());
  });

  // Vite middleware para desarrollo
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
    console.log(`Smart Parking Server running at http://localhost:${PORT}`);
  });
}

startServer();
