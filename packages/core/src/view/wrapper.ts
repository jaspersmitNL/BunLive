import LiveContext from '../context';

export function wrapComponent(html: any, context: LiveContext<any>, args: string = '') {
    return `<div live-id="${context.id}" live-client-id="${context.clientID}" live-component="${context.componentName}" live-args="${args}">${html}</div>`;
}
