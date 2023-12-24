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

        this.on(ctx, 'inc', () => {
            this.assign(ctx, {
                counter: clamp(ctx.state.counter! + 1, 0, 10),
            });
        });

        this.on(ctx, 'dec', () => {
            this.assign(ctx, {
                counter: clamp(ctx.state.counter! - 1, 0, 10),
            });
        });

        this.on(ctx, 'reset', () => {
            this.assign(ctx, {
                counter: 0,
            });
        });

        this.on<EventMessage<{ name: string }>>(ctx, 'onChange', (e) => {
            console.log('onChange', e.data.value!.name);
        });

        this.on<EventMessage<{ name: string }>>(ctx, 'onSubmit', (e) => {
            console.log('onSubmit', e.data.value!.name);
            this.assign(ctx, {
                counter: 123,
            });
        });
    }
    async onUnmount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        super.onUnmount(ctx);
        console.log('[MyLiveView] unmounted');
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
