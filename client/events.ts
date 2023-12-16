import { LiveSocket } from "./socket";

function setupBindEvent(socket: LiveSocket, element: Element, rootElement: Element) {
    if (element.hasAttribute("live-bind-active")) {
        return;
    }

    const varName = element.getAttribute("live-bind")!;
    const id = rootElement.getAttribute("data-live-id")!;

    element.addEventListener("input", () => {
        socket.send({
            type: "event",
            event: "bind",
            data: {
                id: id,
                var: varName,
                value: (element as HTMLInputElement).value,
            },
        });
    });

    element.setAttribute("live-bind-active", "true");
}

function setupFormSubmitEvent(socket: LiveSocket, element: Element, rootElement: Element) {
    if (element.hasAttribute("live-submit-active")) {
        return;
    }

    const id = rootElement.getAttribute("data-live-id")!;
    const functionName = element.getAttribute("live-submit")!;

    element.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(element as HTMLFormElement);

        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        const eventMessage = {
            type: "event",
            event: "submit",
            data: {
                id: id,
                func: functionName,
                formData: data,
            },
        };
        socket.send(eventMessage);
    });

    element.setAttribute("live-submit-active", "true");
}

function setupSimpleEvent(socket: LiveSocket, element: Element, rootElement: Element, event: string) {
    if (element.hasAttribute(`live-${event}-active`)) {
        return;
    }

    const id = rootElement.getAttribute("data-live-id")!;
    const functionName = element.getAttribute(`live-${event}`)!;

    element.addEventListener(event, () => {
        const eventMessage = {
            type: "event",
            event: event,
            data: {
                id: id,
                func: functionName,
            },
        };
        socket.send(eventMessage);
    });

    element.setAttribute(`live-${event}-active`, "true");
}

export function setupEventsRoot(socket: LiveSocket, componentElement: Element) {
    componentElement.querySelectorAll("[live-click]").forEach((element) => {
        setupSimpleEvent(socket, element, componentElement, "click");
    });

    componentElement.querySelectorAll("[live-bind]").forEach((element) => {
        setupBindEvent(socket, element, componentElement);
    });

    componentElement.querySelectorAll("[live-submit]").forEach((element) => {
        setupFormSubmitEvent(socket, element, componentElement);
    });

    componentElement.querySelectorAll("[live-focus]").forEach((element) => {
        setupSimpleEvent(socket, element, componentElement, "focus");
    });

    componentElement.querySelectorAll("[live-blur]").forEach((element) => {
        setupSimpleEvent(socket, element, componentElement, "blur");
    });
}

export function setupEvents(socket: LiveSocket, element: Element, rootElement: Element) {
    if (element.hasAttribute("live-click")) {
        setupSimpleEvent(socket, element, rootElement, "click");
    }

    if (element.hasAttribute("live-bind")) {
        setupBindEvent(socket, element, rootElement);
    }

    if (element.hasAttribute("live-submit")) {
        setupFormSubmitEvent(socket, element, rootElement);
    }

    if (element.hasAttribute("live-focus")) {
        setupSimpleEvent(socket, element, rootElement, "focus");
    }

    if (element.hasAttribute("live-blur")) {
        setupSimpleEvent(socket, element, rootElement, "blur");
    }
}
