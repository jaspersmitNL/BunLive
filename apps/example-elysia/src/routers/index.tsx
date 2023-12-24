import { EventMessage } from '@bunlive/common';
import { LiveView, liveView, liveViewRegistry } from '@bunlive/core';
import LiveContext from '@bunlive/core/dist/context';
import { html } from '@elysiajs/html';
import Elysia from 'elysia';

type MyLiveViewState = {
    counter: number;
};

class MyLiveView extends LiveView<MyLiveViewState> {
    async onMount(ctx: LiveContext<MyLiveViewState>, args: Record<string, any>): Promise<void> {
        console.log('[MyLiveView] mounted');
        this.assign(ctx, {
            counter: 0,
        });
    }
    async onUnmount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        console.log('[MyLiveView] unmounted');
    }

    async onEvent(ctx: LiveContext<MyLiveViewState>, event: EventMessage): Promise<void> {
        switch (event.data.name) {
            case 'inc':
                this.assign(ctx, {
                    counter: ctx.state.counter! + 1,
                });
                break;
            case 'dec':
                this.assign(ctx, {
                    counter: ctx.state.counter! - 1,
                });
                break;
            case 'reset':
                this.assign(ctx, {
                    counter: 0,
                });
                break;
        }
    }

    async render(ctx: LiveContext<MyLiveViewState>): Promise<string> {
        const counter = ctx.state.counter!;
        return (
            <div>
                <p>counter: {counter}</p>
                <br />
                <button live-click="inc">+</button>
                <button live-click="dec">-</button>
                <button live-click="reset">reset</button>
                <br />
                {counter >= 2 && (
                    <div>
                        <p>counter is greater than 2</p>
                    </div>
                )}
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
                <body>{liveView('myLiveView', { tz: 'Europe/Amsterdam' })}</body>
            </html>
        );
    });
