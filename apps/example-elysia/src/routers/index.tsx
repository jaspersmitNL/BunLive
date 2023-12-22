import { LiveView, liveView, liveViewRegistry } from '@bunlive/core';
import LiveContext from '@bunlive/core/dist/context';
import { html } from '@elysiajs/html';
import Elysia from 'elysia';

type MyLiveViewState = {
    message: string;
    tz: string;
    time: string;
};

class MyLiveView extends LiveView<MyLiveViewState> {
    async onMount(ctx: LiveContext<MyLiveViewState>, args: Record<string, any>): Promise<void> {
        console.log('[MyLiveView] mounted');

        this.assign(ctx, {
            message: 'Hello World',
            tz: args.tz,
        });
        ctx.ctx.ticker = setInterval(() => {
            this.assign(ctx, {
                time: this.timeFromTZ(args.tz),
            });
        }, 1000);
    }
    async onUnmount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        clearInterval(ctx.ctx.ticker);
        console.log('[MyLiveView] unmounted');
    }

    timeFromTZ(tz: string) {
        const date = new Date();
        const options = {
            timeZone: tz,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        } as const;
        return date.toLocaleString('en-US', options);
    }

    async render(ctx: LiveContext<MyLiveViewState>): Promise<string> {
        let isLoading = ctx.get('message', '') === '';

        if (isLoading) {
            return <div>Loading...</div>;
        }

        return (
            <div>
                <h1>{ctx.get('message', '')}</h1>
                <p>{ctx.get('tz', '')} </p>
                <p>{ctx.get('time', '')}</p>
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
                    {liveView('myLiveView', { tz: 'Europe/Amsterdam' })}
                    <hr />
                    {liveView('myLiveView', { tz: 'Europe/Lisbon' })}
                </body>
            </html>
        );
    });
