import { LiveContext } from "../live/context";
import { LiveView } from "../live/liveview";

export class TestLiveView extends LiveView {
    constructor() {
        super();
        console.log("TestLiveView constructor");
    }

    async onMount(context: LiveContext): Promise<void> {
        console.log("TestLiveView onMount");
        this.assign(context, {
            test: "Hello, World!",
            updated: new Date().toLocaleTimeString(),
        });

        this.on(context, "test", async (ctx: LiveContext, event: string) => {
            console.log("TestLiveView on test", event);

            this.assign(ctx, {
                test: "Hello, World! " + Math.random(),
                updated: new Date().toLocaleTimeString(),
            });
        });
    }

    async render(context: LiveContext, initialRender: boolean): Promise<string> {
        if (initialRender) {
            console.log("TestLiveView initial render");
            return "<p>InitialRender: True</p>";
        }

        const state = context.state;

        return `
        
            <p>Rerender ${state.get("test")}</p>
            <p>Updated at ${state.get("updated")}</p>
            <button live-click="test">Click me</button>
            `;
    }
}
