import { Message, MessageType, UpdateComponentMessage } from '@bunlive/common';
import { DiffDOM } from '@bunlive/diff-dom';
import { LiveSocket, getLiveSocket } from '.';

export function handleMessage(socket: LiveSocket, message: Message) {
    switch (message.type as MessageType) {
        case 'update_component': {
            handleUpdateComponentMessage(socket, message as UpdateComponentMessage);
        }
    }
}

function handleUpdateComponentMessage(socket: LiveSocket, message: UpdateComponentMessage) {
    // console.log('[Client] Received update_component message: ', message);

    const element = document.querySelector(
        `[live-id="${message.data.liveID}"][live-component="${message.data.componentName}"]`,
    );

    //add loaded tag to element

    if (!element) {
        console.error('[Client] Element not found', message.data.liveID, message.data.componentName);
        window.location.reload();
        return;
    }
    const patch = JSON.parse(message.data.patch);
    const patcher = new DiffDOM({
        compress: true,
        onNodeCreated(node) {
            if (node instanceof HTMLElement) {
                const liveID = node.getAttribute('live-id');
                const componentName = node.getAttribute('live-component');
                const isRegistered = node.getAttribute('live-registered');

                if (!liveID || !componentName || isRegistered) {
                    return;
                }
                console.log('[Client] found new live element: ', node);

                getLiveSocket()?.register(node);
            }
        },
        onNodeDiscarded(node) {
            if (node instanceof HTMLElement) {
                // recursive find all child live elements
                const liveElements = node.querySelectorAll('[live-component]');

                console.log('liveElements', liveElements);

                for (let i = 0; i < liveElements.length; i++) {
                    const element = liveElements[i];

                    const liveID = element.getAttribute('live-id');
                    const componentName = element.getAttribute('live-component');
                    const isRegistered = element.getAttribute('live-registered');

                    if (!liveID || !componentName || !isRegistered) {
                        continue;
                    }
                    console.log('[Client] found discarded live element: ', element);
                    getLiveSocket()?.unregister(element);
                }
            }
        },
    });

    patcher.apply(element, patch);
}
