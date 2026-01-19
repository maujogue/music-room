import { Context } from "@hono/hono";
import { OPENAPI_YAML } from "./openapi-file.ts";

export async function getOpenapiFile(c: Context): Promise<Response> {
  return c.text(OPENAPI_YAML, 200, {
    "Content-Type": "application/x-yaml; charset=utf-8",
  });
}


export async function getOpenapiFilesAsHtml(c: Context): Promise<Response> {
  const origin = new URL(c.req.url).origin;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Music App API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '${origin}/functions/v1/openapi/openapi.yml',
          dom_id: '#swagger-ui',
        });
      };
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
