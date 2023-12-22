import { LiveView } from '..';

export class LiveViewRegistry {
    components: Map<string, LiveView<any>> = new Map();

    register(name: string, component: LiveView<any>) {
        this.components.set(name, component);
    }

    byName<T>(name: string): LiveView<T> {
        return this.components.get(name) as LiveView<T>;
    }
}

export const liveViewRegistry = new LiveViewRegistry();
