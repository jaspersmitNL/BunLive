import { LiveContext } from "../live/context";
import { LiveView } from "../live/liveview";

export class UsersLiveView extends LiveView {
    constructor() {
        super();
    }

    async onMount(context: LiveContext) {
        console.log("UsersView onMount");

        //https://jsonplaceholder.typicode.com/users
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        const users = await response.json();

        this.assign(context, {
            users: users,
        });
    }

    async render(context: LiveContext, initialRender: boolean): Promise<string> {
        if (initialRender) {
            return "Loading...";
        }

        return `
            <h1>Users</h1>
            <ul>
                ${context.state
                    .get("users")
                    .map((user: any) => `<li>${user.name}</li>`)
                    .join("")}
            </ul>
        
        `;
    }
}
