import { EventMessage } from '@bunlive/common';
import { getClosestLiveElement, getLiveSocket } from '.';
const handleClickEvent = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const liveClick = target.getAttribute('live-click');
    if (!liveClick) {
        return;
    }

    const liveElement = getClosestLiveElement(target);

    if (!liveElement) {
        return;
    }

    console.log('click event', liveElement, liveClick);

    const message: EventMessage = {
        type: 'event',
        data: {
            componentName: liveElement.getAttribute('live-component')!,
            liveID: liveElement.getAttribute('live-id')!,
            event: 'click',
            name: liveClick,
        },
    };

    getLiveSocket()?.send(message);
};

const handleInputEvent = (event: any) => {
    const target = event.target as any;

    const liveInput = target.getAttribute('live-input');
    if (!liveInput) {
        return;
    }

    const liveElement = getClosestLiveElement(target);

    if (!liveElement) {
        return;
    }

    console.log('input event', liveElement, liveInput);

    const message: EventMessage = {
        type: 'event',
        data: {
            componentName: liveElement.getAttribute('live-component')!,
            liveID: liveElement.getAttribute('live-id')!,
            event: 'input',
            name: liveInput,
            value: target.value,
        },
    };

    getLiveSocket()?.send(message);
};

export function setupEvents() {
    window.addEventListener('click', handleClickEvent);
    window.addEventListener('input', handleInputEvent);
}
