import { MessageHandler, WebSocketHandler } from "@bunlive/core";
import { ServerWebSocket } from "bun";
import { ElysiaWS } from "elysia/ws";

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

  onConnectionOpen(): void {
    console.log("WebSocket connection opened:", this.getID());
  }

  onMessageReceived(message: any): void {
    console.log("WebSocket message received:", this.getID(), message);

    this.send(["Pong", message]);
  }

  onConnectionClosed(): void {
    console.log("WebSocket connection closed:", this.getID());
  }
  send(message: any): void {
    this.ws.send(message);
  }

  async subscribe(handler: MessageHandler): Promise<string> {
    return "-1";
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
