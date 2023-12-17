import { EventEmitter } from "stream";
import { LiveContext } from "../live/context";
import { LiveView, useLiveState } from "../live/liveview";
import { generateId } from "../utils";

type Todo = {
    id: string;
    text: string;
};

let initialTodos = [
    {
        id: generateId(),
        text: "Create a todo list",
    },
    {
        id: generateId(),
        text: "Add some items",
    },
];

export class ExampleLiveView extends LiveView {
    static eventBus = new EventEmitter();
    async onMount(context: LiveContext): Promise<void> {
        setTimeout(() => {
            this.assign(context, {
                todos: [...initialTodos],
                validation: {
                    isValid: true,
                    error: "",
                },
                loading: false,
            });
        }, 400);

        this.on(context, "onSubmit", async (ctx: LiveContext, { formData }) => {
            const todo = formData["todo"];
            const todos = ctx.state.get("todos") as Todo[];
            const newTodo = {
                id: generateId(),
                text: todo,
            };
            this.assign(ctx, {
                todos: [...todos, newTodo],
            });
            ExampleLiveView.eventBus.emit("newTodo", { from: context.clientID, newTodo });
        });

        this.on(context, "deleteTodo", async (ctx: LiveContext, { liveData }) => {
            const id = liveData;
            const todos = ctx.state.get("todos") as Todo[];
            const filteredTodos = todos.filter((todo) => todo.id !== id);
            this.assign(ctx, {
                todos: filteredTodos,
            });

            ExampleLiveView.eventBus.emit("deleteTodo", { from: context.clientID, id });
        });

        this.on(context, "onInput", async (ctx: LiveContext, { value }) => {
            let validation = {
                isValid: true,
                error: "",
            };

            let rules = [
                {
                    rule: (value: string) => value.length < 3,
                    error: "Todo must be at least 3 characters",
                },
                {
                    rule: (value: string) => value.length > 20,
                    error: "Todo must be less than 20 characters",
                },

                {
                    rule: (value: string) => !/[A-Z]/.test(value),
                    error: "Todo must include a capital letter",
                },
            ];

            for (let rule of rules) {
                if (rule.rule(value)) {
                    validation = {
                        isValid: false,
                        error: rule.error,
                    };
                    break;
                }
            }

            this.assign(ctx, {
                validation,
            });
        });

        ExampleLiveView.eventBus.on("newTodo", ({ from, newTodo }) => {
            const todos = useLiveState<Todo[]>(context, "todos", []);
            if (from !== context.clientID) {
                this.assign(context, {
                    todos: [...todos, newTodo],
                });
            }
        });

        ExampleLiveView.eventBus.on("deleteTodo", ({ from, id }) => {
            const todos = useLiveState<Todo[]>(context, "todos");
            if (from !== context.clientID) {
                const filteredTodos = todos.filter((todo) => todo.id !== id);
                this.assign(context, {
                    todos: filteredTodos,
                });
            }
        });
        console.log("Mounted Example.tsx");
    }

    async render(context: LiveContext) {
        const todos = useLiveState<Todo[]>(context, "todos");
        const validation = useLiveState<{ isValid: boolean; error: string }>(context, "validation");
        const isLoading = useLiveState<boolean>(context, "loading", true);

        console.log("Render Example.tsx", isLoading);

        return (
            <div class="bg-gray-200 h-screen flex items-center justify-center">
                <div class="bg-white p-8 rounded shadow-md w-full sm:w-96">
                    <h1 class="text-2xl font-bold mb-4">Todo List</h1>
                    {isLoading && <h1>Loading...</h1>}

                    <div class="mb-4">
                        <form live-submit="onSubmit">
                            <input
                                type="text"
                                id="todo"
                                name="todo"
                                placeholder="Add a new task"
                                required
                                live-input="onInput"
                                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />

                            {validation?.isValid === false && <p class="text-red-500 text-xs italic">{validation?.error}</p>}

                            <button
                                disabled={!validation?.isValid}
                                type="submit"
                                class={
                                    validation?.isValid
                                        ? "bg-blue-500 text-white p-2 rounded w-full mb-4 hover:bg-blue-600 mt-2"
                                        : "bg-blue-500 text-white p-2 rounded w-full mb-4 hover:bg-blue-600 mt-2 opacity-50 cursor-not-allowed"
                                }
                            >
                                Add Task
                            </button>
                        </form>
                    </div>

                    <ul>
                        {!todos && (
                            //scaffold
                            <li class="flex items-center justify-between bg-gray-100 p-2 mb-2 rounded loading-animation">
                                <span class="text-gray-800">Loading...</span>
                            </li>
                        )}
                        {todos?.map((todo) => (
                            <li id={todo.id} class="flex items-center justify-between bg-gray-100 p-2 mb-2 rounded">
                                <span class="text-gray-800">{todo.text}</span>
                                <button class="text-red-500" live-data={todo.id} live-click="deleteTodo">
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}
