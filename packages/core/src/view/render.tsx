import { generateId, liveViewRegistry, wrapComponent } from '..';
import LiveContext from '../context';

export async function liveView(name: string): Promise<string> {
    const view = liveViewRegistry.byName(name);

    if (!view) {
        throw new Error(`LiveView ${name} not found`);
    }

    const id = name + '-' + generateId();

    const ctx = new LiveContext<any>(id, '-1', name, {});

    const html = await view.render(ctx);

    return wrapComponent(html, ctx);
}
