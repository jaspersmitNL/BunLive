import morphdom from "morphdom";
import { setupEvents, setupEventsRoot } from "./events";
import { LiveMessage } from "./types/message";
import { getLiveComponentElements } from "./utils";

export class LiveSocket {
    ws: WebSocket;
    autoReconnect = true;

    constructor(public url: string) {}

    async onOpen() {
        console.log("WebSocket connected");

        const elements = getLiveComponentElements();

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const id = element.getAttribute("data-live-id");
            const componentName = element.getAttribute("data-live-name");

            if (!id || !componentName) {
                continue;
            }

            this.registerLiveComponent(id, componentName, element);
        }
    }

    async onClose() {
        console.log("WebSocket disconnected");

        if (this.autoReconnect) {
            setTimeout(() => window.location.reload(), 100);
        }
    }

    async onMessage(event: MessageEvent) {
        const message = JSON.parse(event.data) as LiveMessage;

        switch (message.type) {
            case "rerender":
                const element = document.querySelector(`[data-live-id="${message.data.id}"]`);

                if (!element) {
                    console.error(`LiveView ${message.data.id} not found`);
                    return;
                }
                console.log("Rerendering", message);

                morphdom(element, message.data.html, {
                    onNodeAdded: (node) => {
                        if (node instanceof Element) {
                            setupEvents(this, node, element);
                        }
                        return node;
                    },
                });

                break;
        }
    }

    async connect() {
        console.log(`Connecting to WebSocket ${this.url}`);

        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    async send(message: LiveMessage) {
        this.ws.send(JSON.stringify(message));
    }

    private async registerLiveComponent(id: string, name: string, element: Element) {
        console.log(`Registering ${name} with id ${id}`);

        this.send({
            type: "register",
            event: "register",

            data: {
                id,
                name,
            },
        });

        setupEventsRoot(this, element);
    }
}
