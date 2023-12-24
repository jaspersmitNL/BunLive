import { EventMessage } from '@bunlive/common';
import { LiveView, liveView, liveViewChild, liveViewRegistry } from '@bunlive/core';
import LiveContext from '@bunlive/core/dist/context';
import { html } from '@elysiajs/html';
import Elysia from 'elysia';

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export class ChildLiveView extends LiveView<any> {
    async onMount(ctx: LiveContext, args: Record<string, any>): Promise<void> {
        console.log('[ChildLiveView] mounted');
    }
    async onUnmount(ctx: LiveContext): Promise<void> {
        console.log('[ChildLiveView] unmounted');
    }

    async onEvent(ctx: LiveContext, event: EventMessage): Promise<void> {
        console.log('[ChildLiveView] event', event);
    }

    async render(ctx: LiveContext): Promise<string> {
        return <div>ChildLiveView</div>;
    }
}

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
                    counter: clamp(ctx.state.counter! + 1, 0, 10),
                });
                break;
            case 'dec':
                this.assign(ctx, {
                    counter: clamp(ctx.state.counter! - 1, 0, 10),
                });
                break;
            case 'reset':
                this.assign(ctx, {
                    counter: 0,
                });
                break;
            case 'onSubmit':
                console.log('onSubmit', event.data.value);
                break;

            case 'onChange':
                console.log('onChange', event.data.value);
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
                        <h1>uwu</h1>
                        {liveViewChild('childLiveView', 'child', { foo: 'bar' })}
                    </div>
                )}

                <br />
                <form live-submit="onSubmit" live-change="onChange">
                    <div>
                        <label>name</label>
                        <br />
                        <input type="text" name="name" />
                    </div>
                    <button type="submit">submit</button>
                </form>
            </div>
        );
    }
}

liveViewRegistry.register('myLiveView', new MyLiveView());
liveViewRegistry.register('childLiveView', new ChildLiveView());
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
