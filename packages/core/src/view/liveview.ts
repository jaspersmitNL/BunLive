import { EventMessage, UpdateComponentMessage } from '@bunlive/common';
import { DiffDOM, stringToObj } from '@bunlive/diff-dom';
import { liveViewCore, wrapComponent } from '..';
import LiveContext from '../context';

export class LiveView<T> {
    async onMount(ctx: LiveContext<T>, args: Record<string, any>) {}
    async onUnmount(ctx: LiveContext<T>) {
        ctx.unsubscribeAll();
    }
    async render(ctx: LiveContext<T>): Promise<string> {
        throw new Error('Please implement render method');
    }

    useLiveValue<V>(ctx: LiveContext<T>, key: keyof T, defaultValue: V): V {
        const value = ctx.get(key, defaultValue as T[keyof T]);
        return value as V;
    }

    async assign(context: LiveContext<T>, data: Partial<T>) {
        const oldHtml = wrapComponent(await this.render(context), context);

        for (const key in data) {
            context.set(key, data[key] as T[keyof T]);
        }

        const newHtml = wrapComponent(await this.render(context), context);

        const oldDom = stringToObj(oldHtml);
        const newDom = stringToObj(newHtml);

        const differ = new DiffDOM({ compress: true });

        const patch = differ.diff(oldDom, newDom);

        const message: UpdateComponentMessage = {
            type: 'update_component',
            data: {
                componentName: context.componentName,
                liveID: context.id,
                patch: JSON.stringify(patch),
            },
        };

        context.wsHandler?.send(message);
    }

    async update(ctx: LiveContext<T>) {
        return await liveViewCore.updateLiveView(ctx);
    }

    on<E>(ctx: LiveContext<T>, name: string, handler: (event: E) => void) {
        ctx.subscribe(name, handler.bind(this));
    }

    async handleEvent(ctx: LiveContext<T>, event: EventMessage) {
        ctx.eventBus.emit(event.data.name, event);
    }
}
