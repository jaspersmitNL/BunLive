export * from './types';

export function base64Encode(str: string) {
    return Buffer.from(str).toString('base64');
}

export function base64Decode(str: string) {
    return Buffer.from(str, 'base64').toString();
}
