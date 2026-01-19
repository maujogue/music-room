import { search } from "./controllers.ts";
import { Hono } from "jsr:@hono/hono";

const router = new Hono();

router.get("/", search);

export default router;
