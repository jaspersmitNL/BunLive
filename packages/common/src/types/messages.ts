export type Message = {
    type: string;
};

export type RegisterMessage = Message & {
    type: 'register';
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
export type MessageType = 'register' | 'update_component';
