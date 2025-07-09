import trkl from "trkl";
/**
 * @module konbini
 * A simple single-like reactive store that can be used in Svelte
 * This is mainly the observables in [trkl](https://github.com/jbreckmckye/trkl) with the Svelte store contract and a few new functions
 *
 * @example
 * ```ts
 * import { konbini, computed } from "@in5net/konbini";
 *
 * const count = konbini(0);
 * const doubled = computed(() => count() * 2);
 */

/** Called when the store's value changes */
export type Subscriber<T> = (newValue: T, oldValue?: T) => any;
/** Stop listening for changes to a store's value */
export type Unsubscriber = () => void;

/**
 * A store that can be subscribed to
 *
 * This follows the [Svelte store contract](https://svelte.dev/docs/svelte/stores#Store-contract) so it can be prefixed a `$` in Svelte components the same way Svelte stores can.
 */
export interface Konbini<T> {
  /** The underlying trkl store */
  trkl: trkl.Observable<T>;
  /** Get the value of the store */
  (): T;
  /** Set the value of the store */
  (newValue: T): T;
  /** Set the value of the store */
  set(newValue: T): T;
  /**
   * Listen for changes to the store's value.
   * @param subscriber called when the store's value changes
   * @returns a function that can be called to stop listening for changes
   */
  subscribe(subscriber: Subscriber<T>): () => void;
}

/**
 * Create a new store.
 * @param value The initial value of the store
 * @returns A store
 *
 * @example
 * ```ts
 * const count = konbini(0);
 * count() // 0
 * count(2);
 * count() // 2
 * ```
 */
export function konbini<T>(value?: T): Konbini<T> {
  // @ts-expect-error
  const store: Konbini<T> = (...args) => {
    if (!args.length) return store.trkl();

    const value = args[0] as T;
    store.trkl(value);
    return value;
  };
  store.trkl = trkl(value);
  store.set = newValue => store(newValue);
  store.subscribe = subscriber => {
    store.trkl.subscribe(subscriber, true);
    return () => store.trkl.unsubscribe(subscriber);
  };
  return store;
}

/**
 * Creates a computed store, where its value is derived from other stores
 * @param executor A function that returns the value of the store
 * @returns A store
 *
 * @example
 * ```ts
 * const count = konbini(0);
 * const doubled = computed(() => count() * 2);
 * count(2);
 * doubled() // 4
 * ```
 */
export function computed<T>(fn: () => T): Konbini<T> {
  const store = konbini();
  // @ts-expect-error
  store.trkl = trkl.computed(fn);
  // @ts-expect-error
  return store;
}
