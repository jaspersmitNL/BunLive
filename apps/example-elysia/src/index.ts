import { liveViewCore } from '@bunlive/core';
import { ElysiaWebSocketHandler, getWSID } from '@bunlive/elysia-handler';
import staticPlugin from '@elysiajs/static';
import Elysia from 'elysia';
import esbuild from 'esbuild';
import { indexRouter } from './routers';

async function clientBundler() {
    let ctx = await esbuild.context({
        entryPoints: [import.meta.dir + '/client/client.ts'],
        bundle: true,
        outfile: './public/client/client.js',
        platform: 'browser',
        target: 'es2017',
        treeShaking: false,
        sourcemap: true,
    });

    ctx.watch();
}

const app = new Elysia();

app.use(indexRouter);

app.use(
    //@ts-ignore
    staticPlugin({
        prefix: '/',
        alwaysStatic: false,
    }),
);

app.ws('/live', {
    open: (ws) => {
        const handler = new ElysiaWebSocketHandler(ws as any);
        handler.onConnectionOpen();
        liveViewCore.registerConnection(handler);
    },
    message: (ws, message: any) => {
        const id = getWSID(ws as any);

        const handler = <ElysiaWebSocketHandler>liveViewCore.connectionByID(id);

        if (!handler) {
            return;
        }

        //if message is castable to Message
        if (message['type']) {
            handler.onMessageReceived(message);
        }
    },
    close: (ws) => {
        const id = getWSID(ws as any);

        const handler = <ElysiaWebSocketHandler>liveViewCore.connectionByID(id);

        if (!handler) {
            return;
        }
        handler.onConnectionClosed();
        liveViewCore.onConnectionClosed(handler);
        liveViewCore.deleteConnection(id);
    },
});

app.listen(3000, () => {
    console.log('[App] Server is running on http://localhost:3000');
    clientBundler();
});
