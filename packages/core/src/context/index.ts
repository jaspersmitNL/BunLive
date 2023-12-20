import { Optional } from "@bunlive/common";

export default class LiveContext<T> {
  id: string;
  clientID: string;
  state?: Optional<T>;

  constructor(id: string, clientID: string, state?: Optional<T>) {
    this.id = id;
    this.clientID = clientID;
    this.state = state;
  }

  set(key: keyof T, value: T[keyof T]) {
    if (this.state) {
      this.state[key] = value;
    }
  }

  get(key: keyof T, defaultValue: T[keyof T]) {
    if (this.state) {
      return this.state[key] || defaultValue;
    }
    return defaultValue;
  }
}
