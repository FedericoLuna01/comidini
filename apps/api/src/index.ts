import type { Session } from "@repo/auth/client";
import { authHandler } from "@repo/auth/server";
import type { SelectShop } from "@repo/db/src/types/shop";
import cors from "cors";
import express from "express";
import cartRoutes from "./routes/cart.routes";
import mercadopagoRoutes from "./routes/mercadopago.routes";
import ordersRoutes from "./routes/orders.routes";
import productsRoutes from "./routes/products.routes";
import searchRoutes from "./routes/search.routes";
import shopsRoutes from "./routes/shops.routes";
import ticketsRoutes from "./routes/tickets.routes";
import uploadRoutes from "./routes/upload.routes";

declare global {
	namespace Express {
		interface Request {
			session?: Session;
			shop?: SelectShop;
		}
	}
}

const app = express();
const port = process.env.PORT || 3002;

// Middleware
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:5175",
	process.env.ADMIN_URL,
	process.env.WEB_URL,
	process.env.SHOP_URL,
].filter(Boolean) as string[];

app.use(
	cors({
		origin: (origin, callback) => {
			// allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (
				allowedOrigins.indexOf(origin) !== -1 ||
				process.env.NODE_ENV !== "production"
			) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);

// Better Auth handler - debe ir antes del express.json()
app.all("/api/auth/{*any}", authHandler);

// Create a router for all API routes
const apiRouter = express.Router();

// Mount express json middleware after Better Auth handler
apiRouter.use(express.json());

// Mount the API router with the prefix /api
app.use("/api", apiRouter);

apiRouter.get("/", (_, res) => {
	res.send("Welcome to the API!");
});

apiRouter.use("/shops", shopsRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/search", searchRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/orders", ordersRoutes);
apiRouter.use("/mercadopago", mercadopagoRoutes);
apiRouter.use("/tickets", ticketsRoutes);

app.listen(Number(port), "0.0.0.0", () => {
	console.log(`API server running at http://0.0.0.0:${port}`);
});
