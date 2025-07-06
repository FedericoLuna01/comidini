import express from "express";
import cors from "cors";
import { authHandler } from "@repo/auth/server";
import shopsRoutes from "./routes/shops.routes";
import { type Session } from "@repo/auth/client"

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Better Auth handler - debe ir antes del express.json()
app.all("/api/auth/{*any}", authHandler);

// Create a router for all API routes
const apiRouter = express.Router();

// Mount express json middleware after Better Auth handler
apiRouter.use(express.json());

// Mount the API router with the prefix /api
app.use("/api", apiRouter);

apiRouter.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

apiRouter.use("/shops", shopsRoutes);

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
