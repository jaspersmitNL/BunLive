import { LiveSocket } from "./livesocket";
import { LiveView } from "./liveview";

export class LiveContext {
    id: string;
    clientID: string;
    state: Map<string, any>;
    liveView?: LiveView;
    name?: string;
    liveSocket?: LiveSocket;

    constructor(id: string, clientID: string) {
        this.id = id;
        this.clientID = clientID;
        this.state = new Map();
    }

    setState(key: string, value: any) {
        this.state.set(key, value);
    }
}
