import { Message, RegisterMessage } from '@bunlive/common';
import { handleMessage } from './handler';

export class LiveSocket {
    ws?: WebSocket;

    constructor(public url: string) {
        this.url = url;
    }

    onOpen() {
        console.log('[Client] Connected to ' + this.url);

        const liveElements = document.querySelectorAll('[live-component]');
        for (let i = 0; i < liveElements.length; i++) {
            const element = liveElements[i];
            this.register(element);
        }
    }

    onClose() {
        console.log('[Client] Disconnected from ' + this.url);
    }

    onMessage(message: Message) {
        console.log('[Client] Received message: ', message.type);
        handleMessage(this, message);
    }

    connect() {
        console.log('[Client] Connecting to ' + this.url);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = (event: MessageEvent) => {
            this.onMessage(JSON.parse(event.data));
        };
    }

    send<T extends Message>(message: T) {
        if (this.ws) {
            this.ws.send(JSON.stringify(message));
        }
    }

    private register(element: Element) {
        const componentName = element.getAttribute('live-component');
        const liveID = element.getAttribute('live-id');
        const args = element.getAttribute('live-args') || '';

        if (!componentName || !liveID) {
            return;
        }

        this.send<RegisterMessage>({
            type: 'register',
            data: {
                componentName,
                liveID,
                args,
            },
        });
    }
}
