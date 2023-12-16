import { LiveContext } from "../live/context";
import { LiveView } from "../live/liveview";

//extend JSX.HtmlTag type to add live-click attribute
declare global {
    namespace JSX {
        interface HtmlTag {
            "live-click"?: string;
            "live-bind"?: string;
            "live-focus"?: string;
            "live-blur"?: string;
        }
    }
}

function useLiveState(context: LiveContext, key: string) {
    return context.state.get(key)!;
}

export class JSXLiveView extends LiveView {
    constructor() {
        super();
    }

    async onMount(context: LiveContext): Promise<void> {
        this.assign(context, {
            time: new Date().toLocaleTimeString(),
            isBlurred: true,
        });

        this.on(context, "onClick", () => {
            console.log("clicked");
            this.assign(context, {
                time: new Date().toLocaleTimeString(),
            });
        });

        this.on(context, "onBlur", () => {
            console.log("blurred");
            this.assign(context, {
                isBlurred: true,
            });
        });
        this.on(context, "onFocus", () => {
            console.log("focused");
            this.assign(context, {
                isBlurred: false,
            });
        });
    }

    async render(context: LiveContext, isInitialRender: boolean) {
        const time = useLiveState(context, "time");
        const search = useLiveState(context, "search");
        return (
            <div>
                <p>{time}</p>
                <h1>Hello from JSX!: {search}</h1>
                <input
                    type="text"
                    live-bind="search"
                    live-blur="onBlur"
                    live-focus="onFocus"
                    value={search}
                    style={{
                        backgroundColor: context.state.get("isBlurred") ? "red" : "white",
                    }}
                />
                <button live-click="onClick">Click me</button>
            </div>
        );
    }
}
