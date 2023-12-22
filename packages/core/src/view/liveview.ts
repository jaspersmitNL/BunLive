import { UpdateComponentMessage } from '@bunlive/common';
import { DiffDOM, stringToObj } from 'diff-dom';
import { liveViewCore, wrapComponent } from '..';
import LiveContext from '../context';

export class LiveView<T> {
    async onMount(ctx: LiveContext<T>) {}
    async onUnmount(ctx: LiveContext<T>) {}
    async render(ctx: LiveContext<T>): Promise<string> {
        throw new Error('Please implement render method');
    }

    async assign(context: LiveContext<T>, data: Partial<T>) {
        const oldHtml = wrapComponent(await this.render(context), context);

        for (const key in data) {
            context.set(key, data[key] as T[keyof T]);
        }

        const newHtml = wrapComponent(await this.render(context), context);

        const oldDom = stringToObj(oldHtml);
        const newDom = stringToObj(newHtml);

        const differ = new DiffDOM();
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
}
