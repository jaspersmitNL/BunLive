import { Optional } from '@bunlive/common';
import { LiveView, WebSocketHandler } from '..';

export default class LiveContext<T = any> {
    id: string;
    clientID: string;
    componentName: string;
    state: Optional<T>;

    ctx: any = {};

    wsHandler?: WebSocketHandler;
    view?: LiveView<T>;

    constructor(id: string, clientID: string, componentName: string, state: Optional<T> = {}) {
        this.id = id;
        this.clientID = clientID;
        this.componentName = componentName;
        this.state = state;
    }

    set(key: keyof T, value: T[keyof T]) {
        if (this.state) {
            this.state[key] = value;
        }
    }

    get(key: keyof T, defaultValue: T[keyof T]) {
        if (this.state) {
            return this.state[key] || defaultValue;
        }
        return defaultValue;
    }
}
