export type LiveMessage = {
    type: string;
    event: string;
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
