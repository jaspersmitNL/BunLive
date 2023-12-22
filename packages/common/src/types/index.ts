export * from './messages';
export type Optional<T> = { [P in keyof T]?: T[P] };
