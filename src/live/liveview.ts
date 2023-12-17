import { DiffDOM, stringToObj } from "diff-dom";
import { JSDOM } from "jsdom";
import { ReRenderMessage } from "../types/message";
import { LiveContext } from "./context";

type KVPair = { [key: string]: any };

declare global {
    namespace JSX {
        interface HtmlTag {
            "live-click"?: string;
            "live-bind"?: string;
            "live-focus"?: string;
            "live-blur"?: string;
            "live-submit"?: string;

            "live-data"?: string;
            "live-input"?: string;
        }
    }
}

function wrap(html: string, context: LiveContext) {
    const dom = new JSDOM(html);
    const firstDiv = dom.window.document.documentElement.querySelector("body")!.firstElementChild!;

    const wrapper = dom.window.document.createElement("div");
    wrapper.setAttribute("data-live", "true");
    wrapper.setAttribute("data-live-id", context.id);
    wrapper.setAttribute("data-live-name", context.name!);
    wrapper.appendChild(firstDiv);

    return wrapper.outerHTML;
}

export class LiveView {
    async render(context: LiveContext): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async onMount(context: LiveContext) {}

    async assign(context: LiveContext, data: KVPair) {
        const oldHtml = wrap(await this.render(context), context);

        for (const key in data) {
            context.setState(key, data[key]);
        }

        const newHtml = wrap(await this.render(context), context);

        const oldDom = stringToObj(oldHtml);
        const newDom = stringToObj(newHtml);

        const differ = new DiffDOM();
        const diff = differ.diff(oldDom, newDom);

        const rerenderMessage: ReRenderMessage = {
            type: "rerender",
            event: "rerender",
            data: {
                id: context.id,
                diff: JSON.stringify(diff),
            },
        };

        context.liveSocket!.send(rerenderMessage);
    }

    async on(context: LiveContext, event: string, handler: (ctx: LiveContext, data: any) => void) {
        context.eventBus.on(event, handler.bind(this));
    }

    async onEvent(context: LiveContext, data: any) {
        context.eventBus.emit(data.func, context, data);
    }
}

export function useLiveState<T>(context: LiveContext, key: string, defaultValue?: T) {
    const val = context.state.get(key) as T;

    return val ?? defaultValue;
}
export function liveEncode(data: any) {
    return JSON.stringify(data);
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
