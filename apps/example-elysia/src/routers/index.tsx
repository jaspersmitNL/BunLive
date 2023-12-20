import { LiveView, liveView, liveViewRegistry } from "@bunlive/core";
import LiveContext from "@bunlive/core/dist/context";
import { html } from "@elysiajs/html";
import Elysia from "elysia";

type MyLiveViewState = {
  todos: any[];
};

class MyLiveView extends LiveView<MyLiveViewState> {
  async onMount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
    ctx.state.todos = ["foo", "bar"];
  }

  async render(ctx: LiveContext<MyLiveViewState>): Promise<string> {
    return (
      <div>
        <h1>My Live View</h1>
        <ul>
          {ctx.state.todos?.map((todo) => (
            <li>{todo}</li>
          ))}
        </ul>
      </div>
    );
  }
}

liveViewRegistry.register("myLiveView", new MyLiveView());

export const indexRouter = new Elysia()
  //@ts-ignore
  .use(html())

  .get("/", async () => {
    return (
      <html lang="en">
        <head>
          <title>Hello World</title>
        </head>
        <body>
          <h1>Hello World</h1>
          {liveView("myLiveView")}
        </body>
      </html>
    );
  });
