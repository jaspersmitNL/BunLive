import { Optional } from '@bunlive/common';
import { EventEmitter } from 'stream';
import { LiveView, WebSocketHandler, generateId } from '..';

export default class LiveContext<T = any> {
    id: string;
    clientID: string;
    componentName: string;
    state: Optional<T>;
    ctx: any = {};
    eventBus: EventEmitter = new EventEmitter();
    wsHandler?: WebSocketHandler;
    view?: LiveView<T>;
    eventHandlers: Map<string, any> = new Map();

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

    subscribe(event: string, handler: any): string {
        const id = generateId();
        this.eventBus.on(event, handler);
        this.eventHandlers.set(id, handler);
        return id;
    }

    unsubscribe(id: string) {
        const handler = this.eventHandlers.get(id);

        if (handler) {
            this.eventBus.off(id, handler);
        }

        this.eventHandlers.delete(id);
    }
    unsubscribeAll() {
        this.eventHandlers.forEach((handler, id) => {
            this.eventBus.off(id, handler);
        });
        this.eventHandlers.clear();
    }
}
