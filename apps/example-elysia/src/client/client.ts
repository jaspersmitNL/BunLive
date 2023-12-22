import { LiveSocket } from '@bunlive/client';

console.log('client.ts is loading');

async function main() {
    let protocol = 'ws';

    if (window.location.protocol === 'https:') {
        protocol = 'wss';
    }

    const url = protocol + '://' + window.location.host + '/live';

    const socket = new LiveSocket(url);

    (<any>window).liveSocket = socket;
    socket.connect();
}

main().catch((err) => {
    console.error(err);
});
