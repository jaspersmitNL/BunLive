import { JSDOM } from "jsdom";
import { ReRenderMessage } from "../types/message";
import { LiveContext } from "./context";

//Key-Value pair type for string -> any
type KVPair = { [key: string]: any };

export class LiveView {
    async render(context: LiveContext, initialRender: boolean): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async onMount(context: LiveContext) {}

    async assign(context: LiveContext, data: KVPair) {
        for (const key in data) {
            context.setState(key, data[key]);
        }

        const html = await this.render(context, false);

        const dom = new JSDOM(html);
        const root = dom.window.document.documentElement.querySelector("body")!;
        const wrapper = dom.window.document.createElement("div");
        wrapper.setAttribute("data-live", "true");
        wrapper.setAttribute("data-live-id", context.id);
        wrapper.setAttribute("data-live-name", context.name!);
        wrapper.appendChild(root);

        const finalHtml = wrapper.outerHTML;

        const rerenderMessage: ReRenderMessage = {
            type: "rerender",
            event: "rerender",
            data: {
                id: context.id,
                html: finalHtml,
            },
        };

        context.liveSocket!.send(rerenderMessage);
    }

    async on(context: LiveContext, event: string, handler: (ctx: LiveContext, event: string) => void) {
        context.eventBus.on(event, handler.bind(this));
    }

    async onEvent(context: LiveContext, event: string, func: string) {
        context.eventBus.emit(func, context, event);
    }
}

export class LiveViewRegistry {
    private static _instance: LiveViewRegistry;

    private registry: Map<string, LiveView> = new Map();

    public static get instance(): LiveViewRegistry {
        if (!this._instance) {
            this._instance = new LiveViewRegistry();
        }
        return this._instance;
    }

    public register(name: string, component: LiveView) {
        this.registry.set(name, component);
    }

    public get(name: string): LiveView {
        const component = this.registry.get(name);
        if (!component) {
            throw new Error(`Component ${name} not found`);
        }

        return component;
    }
}
