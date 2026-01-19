import { Hono } from "@hono/hono";
import { getOpenapiFile, getOpenapiFilesAsHtml } from "./controller.ts";

const router = new Hono();

router.get("/openapi.yml", getOpenapiFile);
router.get("/swag", getOpenapiFilesAsHtml);

export default router;
