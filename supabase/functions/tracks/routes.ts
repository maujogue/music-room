import { getTracks } from "./controllers.ts";
import { Hono } from "jsr:@hono/hono";

const router = new Hono();

router.get("/", getTracks);

export default router;
