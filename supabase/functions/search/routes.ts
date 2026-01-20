import { search } from "./controllers.ts";
import { Hono } from "jsr:@hono/hono@4.10.3";

const router = new Hono();

router.get("/", search);

export default router;
