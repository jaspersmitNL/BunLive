export function generateId(len: number = 8) {
    const allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result: string = '';
    for (let i = 0; i < len; i++) {
        result += allowed.charAt(Math.floor(Math.random() * allowed.length));
    }
    return result;
}
