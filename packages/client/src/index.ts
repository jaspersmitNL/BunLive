export * from './socket';

function getClosestLiveElement(element: Element): Element | null {
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

//global listener for when a dom node is updated
window.addEventListener('DOMNodeInserted', (event) => {
    const liveElement = getClosestLiveElement(event.target as Element);
    if (liveElement) {
        const isRegistered = liveElement.getAttribute('live-registered');
        if (!isRegistered) {
            console.log('[Client] new element inserted: ', liveElement);
            (<any>window).liveSocket?.register(liveElement);
        }
    }
});
