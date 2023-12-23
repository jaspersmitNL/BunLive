import { Message } from '@bunlive/common';
import { WebSocketHandler, liveViewCore } from '@bunlive/core';
import { ServerWebSocket } from 'bun';
import { ElysiaWS } from 'elysia/ws';

export function setWSID(ws: ElysiaWS<ServerWebSocket<any>>, id: string): void {
    (ws.data as typeof ws.data & { clientID: string }).clientID = id;
}

export function getWSID(ws: ElysiaWS<ServerWebSocket<any>>): string {
    return (ws.data as typeof ws.data & { clientID: string }).clientID;
}

export class ElysiaWebSocketHandler implements WebSocketHandler {
    ws: ElysiaWS<ServerWebSocket<any>>;

    constructor(ws: ElysiaWS<ServerWebSocket<any>>) {
        this.ws = ws;
    }

    onConnectionOpen(): void {}

    onMessageReceived(message: Message): void {
        liveViewCore.handleMessage(message, this);
    }

    onConnectionClosed(): void {}
    send<T extends Message>(message: T): void {
        this.ws.send(message);
    }

    isConnected(): boolean {
        return false;
    }

    setID(id: string): void {
        setWSID(this.ws, id);
    }
    getID(): string {
        return getWSID(this.ws);
    }
}
