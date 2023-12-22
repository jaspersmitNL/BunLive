import { Message, MessageType, RegisterMessage } from '@bunlive/common';
import { WebSocketHandler, generateId, liveViewRegistry } from '.';
import LiveContext from './context';

export class LiveViewCore {
    private connections: Map<string, WebSocketHandler> = new Map();
    private contexts: Map<string, LiveContext> = new Map();

    registerConnection(handler: WebSocketHandler): string {
        const id = generateId();
        handler.setID(id);
        this.connections.set(id, handler);
        return id;
    }

    connectionByID(id: string): WebSocketHandler | undefined {
        return this.connections.get(id);
    }
    deleteConnection(id: string) {
        this.connections.delete(id);
    }

    handleMessage(message: Message, handler: WebSocketHandler) {
        console.log('[Core] Handling message:', message);

        switch (message.type as MessageType) {
            case 'register':
                this.handleRegister(message as RegisterMessage, handler);
                break;
        }
    }

    updateLiveView(context: LiveContext) {
        return 'ok';
    }

    onConnectionClosed(handler: WebSocketHandler) {
        const contexts = Array.from(this.contexts.values()).filter((ctx) => ctx.wsHandler === handler);

        console.log(
            '[Core] Closing contexts:',
            contexts.map((ctx) => ctx.id),
        );

        contexts.forEach((ctx) => ctx.view?.onUnmount(ctx));

        contexts.forEach((ctx) => this.contexts.delete(ctx.id));
    }

    private async handleRegister(message: RegisterMessage, handler: WebSocketHandler) {
        console.log('[Core] Registering component:', message.data.componentName);

        const contextID = message.data.liveID;
        const componentName = message.data.componentName;

        const context = new LiveContext(contextID, handler.getID(), componentName);

        context.wsHandler = handler;
        context.view = liveViewRegistry.byName(componentName);

        this.contexts.set(contextID, context);

        await context.view?.onMount(context);
    }
}

export const liveViewCore = new LiveViewCore();
