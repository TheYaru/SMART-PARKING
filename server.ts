import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { spawn } from "child_process";
import proxy from "express-http-proxy";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Integración con Python Backend ---
  console.log("Iniciando integración con Python...");
  
  // 1. Intentar instalar dependencias de Python
  const pip = spawn("python3", ["-m", "pip", "install", "-r", "backend/requirements.txt"]);
  
  pip.on("error", (err) => {
    console.error("Error al intentar ejecutar pip:", err.message);
    // Si falla pip, intentamos iniciar el proceso de python directamente
    startPythonBackend();
  });

  pip.stdout.on("data", (data) => console.log(`[PIP]: ${data}`));
  
  pip.on("close", (code) => {
    console.log(`Instalación de dependencias Python finalizada (code ${code})`);
    startPythonBackend();
  });

  function startPythonBackend() {
    console.log("Iniciando el servidor Flask...");
    const pythonProcess = spawn("python3", ["backend/app.py"]);
    
    pythonProcess.on("error", (err) => {
      console.error("Error crítico: No se pudo iniciar Python 3.", err.message);
    });

    pythonProcess.stdout.on("data", (data) => {
      console.log(`[Python]: ${data}`);
    });
    
    pythonProcess.stderr.on("data", (data) => {
      console.error(`[Python Error]: ${data}`);
    });
  }

  // 3. Proxy de API hacia Python (Puerto 5000)
  app.use("/api", proxy("http://localhost:5000", {
    proxyReqPathResolver: (req) => `/api${req.url}`
  }));

  // --- Configuración de Vite / Estáticos ---
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
    console.log(`Smart Parking Gateway running at http://localhost:${PORT}`);
    console.log(`Proxying /api to Python Backend on port 5000`);
  });
}

startServer();
