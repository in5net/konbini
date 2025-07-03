export interface Konbini<T> {
  (): T;
  (newValue: T): T;
}

export function konbini<T>(value?: T): Konbini<T> {
  // @ts-expect-error
  const store: Konbini<T> = (...args) => {
    if (!args.length) return value as T;
    value = args[0] as T;
  };
  return store;
}
