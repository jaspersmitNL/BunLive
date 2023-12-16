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
            search: "",
            users: users,
        });
    }

    async render(context: LiveContext, initialRender: boolean): Promise<string> {
        if (initialRender) {
            return "Loading...";
        }

        const search = context.state.get("search");
        return `
            <h1>Users: ${search}</h1>

            <input type="text" live-bind="search" value="${search || ""}" placeholder="Search." />

            <ul>
                ${context.state
                    .get("users")
                    .filter((user: any) => {
                        if (search === "") {
                            return true;
                        }

                        return user.name.toLowerCase().trim().includes(search.toLowerCase());
                    })
                    .map((user: any) => `<li>${user.name}</li>`)
                    .join("")}
            </ul>
        
        `;
    }
}
