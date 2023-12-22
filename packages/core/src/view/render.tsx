import { base64Encode } from '@bunlive/common';
import { generateId, liveViewRegistry, wrapComponent } from '..';
import LiveContext from '../context';

export async function liveView(name: string, args: Record<string, any> = {}): Promise<string> {
    const view = liveViewRegistry.byName(name);

    if (!view) {
        throw new Error(`LiveView ${name} not found`);
    }

    const id = name + '-' + generateId();

    const ctx = new LiveContext<any>(id, '-1', name, {});

    const html = await view.render(ctx);

    return wrapComponent(html, ctx, base64Encode(JSON.stringify(args)));
}

export async function liveViewChild(name: string, id: string, args: Record<string, any> = {}): Promise<string> {
    const view = liveViewRegistry.byName(name);

    if (!view) {
        throw new Error(`LiveView ${name} not found`);
    }

    const ctx = new LiveContext<any>(id, '-1', name, {});

    const html = await view.render(ctx);

    return wrapComponent(html, ctx, base64Encode(JSON.stringify(args)));
}
