import { LiveView, liveView, liveViewRegistry } from '@bunlive/core';
import LiveContext from '@bunlive/core/dist/context';
import { html } from '@elysiajs/html';
import Elysia from 'elysia';

type MyLiveViewState = {
    message: string;

    updatedAt: string;
};

class MyLiveView extends LiveView<MyLiveViewState> {
    async onMount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        console.log('[MyLiveView] mounted');

        this.assign(ctx, {
            message: 'Hello World',
        });

        ctx.ctx.ticker = setInterval(() => {
            console.log('[MyLiveView] update');
            this.assign(ctx, {
                updatedAt: new Date().toLocaleTimeString(),
            });
        }, 1000);
    }
    async onUnmount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        clearInterval(ctx.ctx.ticker);
        console.log('[MyLiveView] unmounted');
    }

    async render(ctx: LiveContext<MyLiveViewState>): Promise<string> {
        return (
            <div>
                <h1>{ctx.get('message', 'Loading...')}</h1>
                <p>{ctx.get('updatedAt', '')}</p>
            </div>
        );
    }
}

liveViewRegistry.register('myLiveView', new MyLiveView());

export const indexRouter = new Elysia()
    //@ts-ignore
    .use(html())

    .get('/', async () => {
        return (
            <html lang="en">
                <head>
                    <title>Hello World</title>
                    <script src="/client/client.js" defer></script>
                </head>
                <body>
                    {liveView('myLiveView')}
                    <hr />
                    {liveView('myLiveView')}
                </body>
            </html>
        );
    });
