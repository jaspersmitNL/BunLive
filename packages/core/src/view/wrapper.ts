import LiveContext from "../context";

export function wrapComponent(html: any, context: LiveContext<any>) {
  return `
    <div live-id="${context.id}" live-client-id="${context.clientID}" live-component="${context.componentName}">${html}</div>
  `;
}
