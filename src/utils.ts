export function generateId(len: number = 5) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < len; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

export function getClientID(ws: any) {
    return (ws.data as any).clientID;
}
export function setClientID(ws: any, id: string) {
    (ws.data as any).clientID = id;
}
