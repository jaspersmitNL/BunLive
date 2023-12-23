import { LiveView, liveView, liveViewChild, liveViewRegistry } from '@bunlive/core';
import LiveContext from '@bunlive/core/dist/context';
import { html } from '@elysiajs/html';
import Elysia from 'elysia';

class ChildLiveView extends LiveView<any> {
    async onMount(ctx: LiveContext<any>, args: Record<string, any>): Promise<void> {
        console.log('[ChildLiveView] mounted');
        this.assign(ctx, {
            name: args.name,
        });
    }
    async onUnmount(ctx: LiveContext<any>): Promise<void> {
        console.log('[ChildLiveView] unmounted');
    }

    async onEvent(ctx: LiveContext<any>, event_type: string, event: string, args?: string | undefined): Promise<void> {
        console.log('[ChildLiveView] event', event_type, event, args);

        if (event === 'onClicChild') {
            this.assign(ctx, {
                name: 'ChildClick',
            });
        }
    }

    async render(ctx: LiveContext<any>): Promise<string> {
        return (
            <div>
                <p>Child Live View</p>
                <button live-click="onClicChild">ChildClick</button>
                <p>{ctx.get('name', '')}</p>
            </div>
        );
    }
}

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
                time: this.timeFromTZ(ctx.get('tz', '')),
            });
        }, 1000);
    }
    async onUnmount(ctx: LiveContext<MyLiveViewState>): Promise<void> {
        clearInterval(ctx.ctx.ticker);
        console.log('[MyLiveView] unmounted');
    }
    async onEvent(
        ctx: LiveContext<MyLiveViewState>,
        event_type: string,
        event: string,
        args?: string | undefined,
    ): Promise<void> {
        if (event === 'onClickMe') {
            //swap tz from europe/Ams to europe/Lisbon
            const tz = this.useLiveValue<string>(ctx, 'tz', '');
            if (tz == 'Europe/Amsterdam') {
                this.assign(ctx, {
                    tz: 'Europe/Lisbon',
                });
            } else {
                this.assign(ctx, {
                    tz: 'Europe/Amsterdam',
                });
            }
        }

        console.log('[MyLiveView] event', event_type, event, args);
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

        const tz = this.useLiveValue(ctx, 'tz', '');
        const time = this.useLiveValue(ctx, 'time', '');

        return (
            <div>
                <h1>{ctx.get('message', '')}</h1>
                <button live-click="onClickMe">ClickMe</button>
                <p>{tz} </p>
                <p>{time}</p>
                <hr />
                {liveViewChild('childLiveView', 'child-1', { name: 'ChildComponent works' })}
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
