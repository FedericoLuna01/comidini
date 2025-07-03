import express from "express";
import cors from "cors";
import { authHandler, webAuthHandler } from "@repo/auth/server";

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
app.all("/api/web/auth/{*any}", webAuthHandler);

// Mount express json middleware after Better Auth handler
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});