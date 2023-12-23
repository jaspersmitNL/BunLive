import { LiveSocket } from '.';

export * from './socket';

export function getLiveSocket(): LiveSocket {
    return (<any>window).liveSocket;
}

export function getClosestLiveElement(element: Element): Element | null {
    if (element.getAttribute === undefined) {
        return null;
    }
    if (element.getAttribute('live-component')) {
        return element;
    }
    if (element.parentElement) {
        return getClosestLiveElement(element.parentElement);
    }
    return null;
}
