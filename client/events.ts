import { LiveSocket } from "./socket";

export function setupEventsRoot(socket: LiveSocket, componentElement: Element) {
    componentElement.querySelectorAll("[live-click]").forEach((element) => {
        if (element.hasAttribute("data-live-click")) {
            return;
        }

        console.log("live-click", element);

        const functionName = element.getAttribute("live-click")!;
        const id = componentElement.getAttribute("data-live-id")!;

        element.addEventListener("click", () => {
            socket.send({
                type: "event",
                event: "click",
                data: {
                    id: id,
                    func: functionName,
                },
            });
        });

        element.setAttribute("data-live-click", functionName);
    });

    //live-bind
    componentElement.querySelectorAll("[live-bind]").forEach((element) => {
        if (element.hasAttribute("data-live-bind")) {
            return;
        }

        const varName = element.getAttribute("live-bind")!;
        const id = componentElement.getAttribute("data-live-id")!;

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

        element.setAttribute("data-live-bind", varName);
    });
}

export function setupEvents(socket: LiveSocket, element: Element, rootElement: Element) {
    //if element has live-click attribute
    //add event listener to element

    if (element.hasAttribute("live-click")) {
        const functionName = element.getAttribute("live-click")!;
        const id = rootElement.getAttribute("data-live-id")!;

        element.addEventListener("click", () => {
            socket.send({
                type: "event",
                event: "click",
                data: {
                    id: id,
                    func: functionName,
                },
            });
        });
    }

    if (element.hasAttribute("live-bind")) {
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
    }
}
