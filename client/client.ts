import { LiveSocket } from "./socket";

async function main() {
    let protocol = "ws";

    if (window.location.protocol === "https:") {
        protocol = "wss";
    }

    const url = protocol + "://" + window.location.host + "/livesocket";

    const ws = new LiveSocket(url);
    await ws.connect();
}

main().catch((err) => {
    console.error(err);
});
