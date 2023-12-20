export type MessageHandler = (message: any) => Promise<void>;

export interface WebSocketHandler {
  send(message: any): void;
  subscribe(handler: MessageHandler): Promise<string>;
  isConnected(): boolean;

  setID(id: string): void;
  getID(): string;
}
