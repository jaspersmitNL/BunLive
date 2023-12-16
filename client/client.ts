import { LiveSocket } from "./socket";

async function main() {
    const ws = new LiveSocket("ws://localhost:8080/livesocket");
    await ws.connect();
}

main().catch((err) => {
    console.error(err);
});
