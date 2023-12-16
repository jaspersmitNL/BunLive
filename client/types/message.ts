export type LiveMessage = {
    type: string;
    event: string;
    data: any;
};

export type RegisterMessage = LiveMessage & {
    data: {
        id: string;
        name: string;
    };
};

export type ReRenderMessage = LiveMessage & {
    data: {
        id: string;
        html: string;
    };
};
