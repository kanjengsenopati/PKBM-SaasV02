import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import * as auth from './actions/auth';
import * as dashboard from './actions/dashboard';
import * as user from './actions/user';
import * as tenant from './actions/tenant';
import * as rbac from './actions/rbac';
import * as student from './actions/student';
import * as tutor from './actions/tutor';
import * as academic from './actions/academic';
import * as finance from './actions/finance';
import * as report from './actions/report';
import * as schema from './actions/schema';
import * as userManagement from './actions/user-management';
import * as rbacMatrix from './actions/rbac-matrix';
import dbSyncHandler from './api/install/db-sync';

const modules: Record<string, any> = { 
  auth, dashboard, user, tenant, rbac, student, tutor, 
  academic, finance, report, schema, userManagement, rbacMatrix 
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // RPC Endpoint
  app.post("/api/rpc", async (req, res) => {
    try {
      const { module, functionName, args = [] } = req.body;
      
      if (!modules[module] || !modules[module][functionName]) {
        console.warn(`[RPC] Function ${module}.${functionName} not found`);
        return res.status(404).json({ 
          success: false, 
          error: `Function ${module}.${functionName} not found` 
        });
      }

      const result = await modules[module][functionName](...args);
      res.json(result);
    } catch (error: any) {
      console.error(`[RPC Error] ${req.body.module}.${req.body.functionName}:`, error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal Server Error'
      });
    }
  });

  // Migrate Endpoint
  app.get("/api/migrate", async (req, res) => {
    try {
      const result = await dbSyncHandler();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
