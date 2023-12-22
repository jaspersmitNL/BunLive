export type MessageHandler = (message: any) => Promise<void>;

export interface WebSocketHandler {
    send(message: any): void;
    isConnected(): boolean;

    setID(id: string): void;
    getID(): string;
}
