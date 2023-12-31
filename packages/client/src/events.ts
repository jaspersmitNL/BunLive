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

const handleSubmitEvent = (event: any) => {
    const target = event.target as any;
    const liveSubmit = target.getAttribute('live-submit');
    if (!liveSubmit) {
        return;
    }

    const liveElement = getClosestLiveElement(target);

    if (!liveElement) {
        return;
    }

    event.preventDefault();

    const formData = new FormData(target);
    console.log('submit event', Object.fromEntries(formData));

    const message: EventMessage<any> = {
        type: 'event',
        data: {
            componentName: liveElement.getAttribute('live-component')!,
            liveID: liveElement.getAttribute('live-id')!,
            event: 'submit',
            name: liveSubmit,
            value: Object.fromEntries(formData),
        },
    };

    getLiveSocket()?.send(message);
};

const handleChangeEvent = (event: any) => {
    const target = event.target as any;
    const form = target.form;

    if (!form) {
        return;
    }

    const liveElement = getClosestLiveElement(target);
    const liveChange = form.getAttribute('live-change');

    if (!liveElement || !liveChange) {
        return;
    }

    const formData = new FormData(form);

    const message: EventMessage<any> = {
        type: 'event',
        data: {
            componentName: liveElement.getAttribute('live-component')!,
            liveID: liveElement.getAttribute('live-id')!,
            event: 'change',
            name: liveChange,
            value: Object.fromEntries(formData),
        },
    };

    getLiveSocket()?.send(message);
};

export function setupEvents() {
    window.addEventListener('click', handleClickEvent);
    window.addEventListener('input', handleInputEvent);
    window.addEventListener('submit', handleSubmitEvent);

    for (let type of ['change', 'input']) {
        window.addEventListener(type, handleChangeEvent);
    }
}
