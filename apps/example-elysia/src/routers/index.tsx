import { EventMessage } from '@bunlive/common';
import { LiveView, liveView, liveViewChild, liveViewRegistry } from '@bunlive/core';
import LiveContext from '@bunlive/core/dist/context';
import { html } from '@elysiajs/html';
import Elysia from 'elysia';

type MyLiveViewState = {
    message: string;
    name: string;
};

class MyLiveView extends LiveView<MyLiveViewState> {
    async onMount(ctx: LiveContext<MyLiveViewState>, args: Record<string, any>): Promise<void> {
        console.log('[MyLiveView] mounted');
        this.assign(ctx, {
            message: 'Hello World',
        });
    }
    async onUnmount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        console.log('[MyLiveView] unmounted');
    }

    async onEvent(ctx: LiveContext<MyLiveViewState>, event: EventMessage): Promise<void> {
        switch (event.data.event) {
            case 'input': {
                console.log('[MyLiveView] input', event.data.value);
                this.assign(ctx, {
                    name: event.data.value,
                });
                break;
            }
            case 'click': {
                console.log('[MyLiveView] click');
                this.assign(ctx, {
                    name: 'clicked',
                });
                break;
            }
        }
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

        const name = this.useLiveValue(ctx, 'name', '');

        return (
            <div>
                <h1>{ctx.get('message', '')}</h1>
                <button live-click="onClickMe">ClickMe</button>
                {name && <p>Hello {name}</p>}
                <hr />
                <input type="text" live-input="onInput" value={name} />
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
