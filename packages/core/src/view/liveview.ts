import LiveContext from "../context";

export default class LiveView<T> {
  async onMount(ctx: LiveContext<T>) {}
  async onUnmount(ctx: LiveContext<T>) {}
  async render(ctx: LiveContext<T>): Promise<string> {
    throw new Error("Please implement render method");
  }
}
