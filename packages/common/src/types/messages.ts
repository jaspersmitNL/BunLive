export type MessageType = 'register' | 'update_component' | 'event';

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

export type UpdateComponentMessage = Message & {
    type: 'update_component';
    data: {
        componentName: string;
        liveID: string;
        patch: string;
    };
};

export type EventType = 'click';
export type EventMessage = Message & {
    type: 'event';
    data: {
        componentName: string;
        liveID: string;
        event: EventType;
        name: string;
        args?: string;
    };
};
