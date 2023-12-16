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
            "live-submit"?: string;
        }
    }
}

type Todo = {
    id: number;
    text: string;
    completed: boolean;
};

function useLiveState<T>(context: LiveContext, key: string) {
    return context.state.get(key)! as T;
}

export class JSXLiveView extends LiveView {
    constructor() {
        super();
    }

    async onMount(context: LiveContext): Promise<void> {
        this.assign(context, {
            time: new Date().toLocaleTimeString(),
            isBlurred: true,
            todos: [] as Todo[],
        });

        this.on(context, "onClick", () => {
            this.assign(context, {
                time: new Date().toLocaleTimeString(),
            });
        });

        this.on(context, "onBlur", () => {
            this.assign(context, {
                isBlurred: true,
            });
        });
        this.on(context, "onFocus", () => {
            this.assign(context, {
                isBlurred: false,
            });
        });

        this.on(context, "onSubmit", async (ctx: LiveContext, { formData }) => {
            console.log("submitted", formData);

            const todo = formData["todo"];
            const todos = ctx.state.get("todos") as Todo[];
            todos.push({
                id: todos.length,
                text: todo,
                completed: false,
            });
            this.assign(ctx, {
                todos,
            });
        });
    }

    async render(context: LiveContext, isInitialRender: boolean) {
        const time = useLiveState<string>(context, "time");
        const search = useLiveState<string>(context, "search");
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

                <br />
                <br />

                <h2>Todo list</h2>
                <ul>{context.state.get("todos")?.map((todo: Todo) => <li id={todo.id}>{todo.text}</li>)}</ul>

                <br />

                <form live-submit="onSubmit">
                    <label for="todo">Todo</label>
                    <br />
                    <input type="text" id="todo" name="todo" required />
                    <button type="submit">Add</button>
                </form>
            </div>
        );
    }
}
