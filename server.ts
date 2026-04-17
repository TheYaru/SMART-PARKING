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
  
  const startPythonBackend = () => {
    console.log("Lanzando proceso Python (backend/app.py)...");
    const pythonProcess = spawn("python3", ["backend/app.py"]);
    
    pythonProcess.on("error", (err) => {
      console.error("No se pudo iniciar python3, intentando con python...", err.message);
      const fallbackProcess = spawn("python", ["backend/app.py"]);
      fallbackProcess.on("error", (e) => console.error("Error crítico: Python no encontrado.", e.message));
    });

    pythonProcess.stdout.on("data", (data) => console.log(`[Python]: ${data}`));
    pythonProcess.stderr.on("data", (data) => console.error(`[Python Error]: ${data}`));
  };

  // Intentamos instalar dependencias en segundo plano pero lanzamos el server lo antes posible
  // La mayoría de entornos ya tienen flask instalado.
  const pip = spawn("python3", ["-m", "pip", "install", "flask", "flask-cors"]);
  pip.on("close", () => {
    console.log("Verificación de dependencias Python completada.");
    startPythonBackend();
  });
  pip.on("error", () => {
    console.warn("Pip no disponible, intentando iniciar server directamente...");
    startPythonBackend();
  });

  // 3. Proxy de API hacia Python (Puerto 5000)
  // Añadimos manejo de errores para evitar que las peticiones /api caigan al SPA (HTML)
  app.use("/api", proxy("http://localhost:5000", {
    proxyReqPathResolver: (req) => `/api${req.url}`,
    proxyErrorHandler: (err, res, next) => {
      console.error("[Proxy Error]: No se pudo conectar con el backend Python (5000).", err.message);
      res.status(503).json({ 
        error: "Servidor de Sensores no disponible", 
        details: "El backend Python aún está iniciando o falló.",
        code: err.code 
      });
    }
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
