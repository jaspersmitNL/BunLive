import { ServerWebSocket } from "bun";
import { ElysiaWS } from "elysia/ws";
import { LiveMessage, RegisterMessage } from "../types/message";
import { LiveContext } from "./context";
import { LiveViewRegistry } from "./liveview";

export class LiveSocket {
    ws?: ElysiaWS<ServerWebSocket<any>>;
    contexts: Map<string, LiveContext> = new Map();

    constructor(public clientID: string) {}

    onOpen(ws: ElysiaWS<ServerWebSocket<any>>) {
        this.ws = ws;
    }

    onMessage(ws: ElysiaWS<ServerWebSocket<any>>, payload: LiveMessage) {
        switch (payload.type) {
            case "register":
                this.registerLiveComponent(ws, payload as RegisterMessage);
                break;

            case "event": {
                if (payload.event === "click") {
                    const data = (payload as any).data as any;

                    const id = data.id;
                    const func = data.func;

                    const context = this.contexts.get(id);

                    if (!context) {
                        console.error("Context not found", id);
                        return;
                    }

                    context.liveView!.onEvent(context, payload.event, func);
                }

                break;
            }
        }
    }

    onClose(ws: ElysiaWS<ServerWebSocket<any>>) {}

    send(message: any) {
        this.ws!.send(JSON.stringify(message));
    }

    private async registerLiveComponent(ws: ElysiaWS<ServerWebSocket<any>>, payload: RegisterMessage) {
        const context = new LiveContext(payload.data.id, this.clientID);

        context.name = payload.data.name;

        const liveView = LiveViewRegistry.instance.get(payload.data.name)!;

        context.liveView = liveView;
        context.liveSocket = this;
        this.contexts.set(payload.data.id, context);
        console.log("Registering", payload.data.name, payload.data.id);

        liveView.onMount(context);
    }
}
