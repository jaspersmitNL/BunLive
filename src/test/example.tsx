import { LiveContext } from "../live/context";
import { LiveView, liveEncode, useLiveState } from "../live/liveview";
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
    async onMount(context: LiveContext): Promise<void> {
        this.assign(context, {
            todos: [...initialTodos],
        });

        this.on(context, "onSubmit", async (ctx: LiveContext, { formData }) => {
            const todo = formData["todo"];
            const todos = ctx.state.get("todos") as Todo[];
            todos.push({
                id: generateId(),
                text: todo,
            });
            this.assign(ctx, {
                todos,
            });
        });

        this.on(context, "deleteTodo", async (ctx: LiveContext, { liveData }) => {
            const { id } = liveData;
            const todos = ctx.state.get("todos") as Todo[];
            const filteredTodos = todos.filter((todo) => todo.id !== id);
            this.assign(ctx, {
                todos: filteredTodos,
            });
        });
    }

    async render(context: LiveContext, initialRender: boolean) {
        const todos = useLiveState<Todo[]>(context, "todos");

        return (
            <div class="bg-gray-200 h-screen flex items-center justify-center">
                <div class="bg-white p-8 rounded shadow-md w-full sm:w-96">
                    <h1 class="text-2xl font-bold mb-4">Todo List</h1>

                    <div class="mb-4">
                        <form live-submit="onSubmit">
                            <input
                                type="text"
                                id="todo"
                                name="todo"
                                placeholder="Add a new task"
                                required
                                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                            <button type="submit" class="bg-blue-500 text-white p-2 rounded w-full mb-4 hover:bg-blue-600 mt-2">
                                Add Task
                            </button>
                        </form>
                    </div>

                    <ul>
                        {todos?.map((todo) => (
                            <li id={todo.id} class="flex items-center justify-between bg-gray-100 p-2 mb-2 rounded">
                                <span class="text-gray-800">{todo.text}</span>
                                <button class="text-red-500" live-data={liveEncode({ id: todo.id })} live-click="deleteTodo">
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
