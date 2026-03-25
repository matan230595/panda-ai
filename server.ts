
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Proxy routes for other AI providers
  app.post("/api/ai/proxy", async (req, res) => {
    const { endpoint, method, headers, body } = req.body;
    try {
      const response = await fetch(endpoint, {
        method: method || 'POST',
        headers: headers || {},
        body: body ? JSON.stringify(body) : undefined
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const data = await response.text();
        res.status(response.status).send(data);
      }
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy for video downloads
  app.get("/api/video/proxy", async (req, res) => {
    const { url, key } = req.query;
    if (!url) return res.status(400).send("URL is required");
    
    try {
      const response = await fetch(url as string, {
        headers: { 'x-goog-api-key': key as string }
      });
      
      if (!response.ok) {
        return res.status(response.status).send("Failed to fetch video");
      }

      const contentType = response.headers.get("content-type") || "video/mp4";
      res.setHeader("Content-Type", contentType);
      
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("Video proxy error:", error);
      res.status(500).send(error.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
