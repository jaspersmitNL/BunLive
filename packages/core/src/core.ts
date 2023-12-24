import { EventMessage, Message, MessageType, RegisterMessage, UnregisterMessage, base64Decode } from '@bunlive/common';
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
        switch (message.type as MessageType) {
            case 'register':
                this.handleRegister(message as RegisterMessage, handler);
                break;
            case 'unregister': {
                this.handleUnregister(message as UnregisterMessage, handler);
                break;
            }
            case 'event':
                this.handleEvent(message as EventMessage, handler);
                break;
        }
    }

    updateLiveView(context: LiveContext) {
        return 'ok';
    }

    onConnectionClosed(handler: WebSocketHandler) {
        const wsID = handler.getID();

        const contexts = Array.from(this.contexts.values()).filter((ctx) => ctx.wsHandler?.getID() === wsID);

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

        let args: Record<string, any> = {};

        try {
            args = JSON.parse(base64Decode(message.data.args));
        } catch (e) {
            console.error('[Core] Failed to parse args:', e);
        }

        await context.view?.onMount(context, args);
    }

    private async handleUnregister(message: UnregisterMessage, handler: WebSocketHandler) {
        const context = this.contexts.get(message.data.liveID);

        if (!context) {
            console.error('[Core] Context not found:', message.data.liveID);
            return;
        }

        await context.view?.onUnmount(context);

        this.contexts.delete(message.data.liveID);

        console.log('[Core] Unregistered component:', message.data.componentName);
    }

    private async handleEvent(message: EventMessage, handler: WebSocketHandler) {
        const context = this.contexts.get(message.data.liveID);

        if (!context) {
            console.error('[Core] Context not found:', message.data.liveID);
            return;
        }

        await context.view?.onEvent(context, message);
    }
}

export const liveViewCore = new LiveViewCore();
