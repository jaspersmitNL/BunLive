import { EventEmitter } from "stream";
import { LiveSocket } from "./livesocket";
import { LiveView } from "./liveview";

export class LiveContext {
    id: string;
    clientID: string;
    state: Map<string, any>;
    liveView?: LiveView;
    name?: string;
    liveSocket?: LiveSocket;
    eventBus: EventEmitter = new EventEmitter();

    constructor(id: string, clientID: string) {
        this.id = id;
        this.clientID = clientID;
        this.state = new Map();
    }

    setState(key: string, value: any) {
        this.state.set(key, value);
    }
}
