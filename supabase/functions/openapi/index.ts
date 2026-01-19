import { Hono } from "hono";
import openapiRoutes from "./routes.ts";

const app = new Hono();

app.route("/openapi", openapiRoutes);

export default app;
