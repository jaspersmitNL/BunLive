import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import Elysia from "elysia";
import esbuild from "esbuild";
import { JSDOM } from "jsdom";
import { LiveContext } from "./live/context";
import { LiveSocket } from "./live/livesocket";
import { LiveViewRegistry } from "./live/liveview";
import { ExampleLiveView } from "./test/example";
import { generateId, getClientID, setClientID } from "./utils";

let connections = new Map<string, LiveSocket>();

export async function liveView(name: string) {
    const view = LiveViewRegistry.instance.get(name);

    const id = `${name}-${generateId()}`;

    let html = await view.render(new LiveContext(id, ""), true);
    const dom = new JSDOM(html);

    const root = dom.window.document.documentElement.querySelector("body")!;

    const wrapper = dom.window.document.createElement("div");
    wrapper.setAttribute("data-live", "true");
    wrapper.setAttribute("data-live-id", id);
    wrapper.setAttribute("data-live-name", name);

    wrapper.appendChild(root);

    const finalHtml = wrapper.outerHTML;
    return finalHtml;
}

LiveViewRegistry.instance.register("example", new ExampleLiveView());

new Elysia()
    .use(html())
    .use(
        staticPlugin({
            prefix: "/",
            alwaysStatic: false,
        }),
    )

    .ws("/livesocket", {
        open: (ws) => {
            const clientID = generateId();
            setClientID(ws, clientID);
            connections.set(clientID, new LiveSocket(clientID));
            connections.get(clientID)?.onOpen(ws as any);
        },
        message: (ws, message) => {
            const clientID = getClientID(ws);
            connections.get(clientID)?.onMessage(ws as any, message as any);
        },
        close: (ws) => {
            const clientID = getClientID(ws);
            connections.get(clientID)?.onClose(ws as any);
            connections.delete(clientID);
        },
    })

    .get("/", async () => {
        return `
            <html lang="en">
                <head>
                    <title>Hello World</title>
                    <script src="/client/client.js"></script>
                    <link href="/client/client.css" rel="stylesheet">

                </head>
                <body>
                    ${await liveView("example")}
                </body>
            </html>
        `;
    })
    .listen(8080, () => console.log("Server is running on http://localhost:8080"));

async function buildClient() {
    let ctx = await esbuild.context({
        entryPoints: ["./client/client.ts"],
        bundle: true,
        outfile: "./public/client/client.js",
        platform: "browser",
        target: "es2017",
        sourcemap: true,
    });

    ctx.watch();
}

buildClient();
