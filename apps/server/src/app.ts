import { Hono } from "hono";
import { healthRoute } from "./routes/health.js";

export const app = new Hono().basePath("/api/v1").route("/", healthRoute);
