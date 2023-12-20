import { html } from "@elysiajs/html";
import Elysia from "elysia";

export const indexRouter = new Elysia({})
  .use(html())

  .get("/", async () => {
    return (
      <html lang="en">
        <head>
          <title>Hello World</title>
        </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    );
  });
