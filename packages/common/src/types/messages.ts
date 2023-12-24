export type MessageType = 'register' | 'unregister' | 'update_component' | 'event';

export type Message = {
    type: MessageType;
};

export type RegisterMessage = Message & {
    type: 'register';
    data: {
        componentName: string;
        liveID: string;
        args: string;
    };
};

export type UnregisterMessage = Message & {
    type: 'unregister';
    data: {
        componentName: string;
        liveID: string;
    };
};

export type UpdateComponentMessage = Message & {
    type: 'update_component';
    data: {
        componentName: string;
        liveID: string;
        patch: string;
    };
};

export type EventType = 'click' | 'input' | 'submit';
export type EventMessage<T = string> = Message & {
    type: 'event';
    data: {
        componentName: string;
        liveID: string;
        event: EventType;
        name: string;
        value?: T;
        args?: string;
    };
};
