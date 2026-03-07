/**
 * Cross-Browser JavaScript Polyfills
 *
 * This file provides polyfills for modern JavaScript features
 * to ensure compatibility with older browsers including:
 * - Safari (older versions)
 * - Firefox (older versions)
 * - Internet Explorer 11
 * - Opera
 * - Brave
 *
 * Note: Many linter warnings about prototype modification are intentional
 * as this is the nature of polyfills.
 */

// ==================== Type Definitions ====================

/** Generic indexed object type */
type IndexedObject<T = unknown> = Record<string | number, T>;

/** Array-like object */
interface ArrayLikeObject<T> {
  readonly length: number;
  readonly [index: number]: T;
}

/** Extended Element prototype for legacy browsers */
interface LegacyElementPrototype {
  msMatchesSelector?: Element["matches"];
  webkitMatchesSelector?: Element["matches"];
}

/** Extended globalThis for polyfills */
interface PolyfillGlobalThis {
  AggregateError?: new (errors: Iterable<unknown>, message?: string) => Error;
  queueMicrotask?: (callback: () => void) => void;
  AbortController?: typeof AbortController;
  CustomEvent?: typeof CustomEvent;
}

// ==================== Polyfill Initialization ====================

// Only run polyfills in browser environment
if (globalThis?.window !== undefined) {
  initializePolyfills();
}

function initializePolyfills(): void {
  initializeObjectPolyfills();
  initializeArrayPolyfills();
  initializeStringPolyfills();
  initializePromisePolyfills();
  initializeElementPolyfills();
  initializeNumberPolyfills();
  initializeMiscPolyfills();
}

// ==================== Object Polyfills ====================

function initializeObjectPolyfills(): void {
  // Object.fromEntries Polyfill
  if (!Object.fromEntries) {
    Object.fromEntries = function <T = unknown>(
      entries: Iterable<readonly [PropertyKey, T]>,
    ): Record<string, T> {
      const obj: Record<string, T> = {};
      for (const [key, value] of entries) {
        obj[key as string] = value;
      }
      return obj;
    };
  }

  // Object.entries Polyfill
  if (!Object.entries) {
    Object.entries = function <T>(obj: Record<string, T> | ArrayLikeObject<T>): [string, T][] {
      const ownProps = Object.keys(obj);
      const resArray: [string, T][] = [];
      for (const key of ownProps) {
        resArray.push([key, (obj as IndexedObject<T>)[key]]);
      }
      return resArray;
    };
  }

  // Object.values Polyfill
  if (!Object.values) {
    Object.values = function <T>(obj: Record<string, T> | ArrayLikeObject<T>): T[] {
      return Object.keys(obj).map((key) => (obj as IndexedObject<T>)[key]);
    };
  }

  // Object.assign Polyfill
  if (!Object.assign) {
    Object.assign = function <T extends object, U>(target: T, ...sources: U[]): T & U {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      const to = new Object(target) as T & U;
      for (const source of sources) {
        if (source != null) {
          for (const key in source) {
            if (Object.hasOwn(source as object, key)) {
              (to as IndexedObject)[key] = (source as IndexedObject)[key];
            }
          }
        }
      }
      return to;
    };
  }
}

// ==================== Array Polyfills ====================

// Shared helper to resolve negative indices for at() polyfills
const getRelativeIndex = (length: number, index: number): number => {
  const relative = index >= 0 ? index : length + index;
  return relative >= 0 && relative < length ? relative : -1;
};

// Guarded defineProperty to avoid errors on frozen/read-only prototypes
const safeDefine = (target: object, property: string | symbol, descriptor: PropertyDescriptor) => {
  const existingDescriptor = Object.getOwnPropertyDescriptor(target, property);
  if (existingDescriptor?.configurable === false) return;
  if (!Object.isExtensible(target)) return;
  try {
    Object.defineProperty(target, property, descriptor);
  } catch {
    // Silently skip when prototype is not extensible
  }
};

// Shared at() implementation for array-like structures
function atPolyfill<T>(this: ArrayLike<T>, index: number): T | undefined {
  const len = this.length;
  const relativeIndex = getRelativeIndex(len, index);
  if (relativeIndex === -1) return undefined;
  return this[relativeIndex];
}

function initializeArrayPolyfills(): void {
  // Array.prototype.flat Polyfill
  if (!Array.prototype.flat) {
    const flatImpl = function <T>(this: T[][], depth: number = 1): T[] {
      const flatten = (arr: unknown[], d: number): unknown[] => {
        if (d <= 0) return arr.slice();
        return arr.reduce<unknown[]>((acc, val) => {
          if (Array.isArray(val)) {
            return acc.concat(flatten(val, d - 1));
          }
          return acc.concat(val);
        }, []);
      };
      return flatten(this, depth) as T[];
    };
    safeDefine(Array.prototype, "flat", {
      value: flatImpl,
      configurable: true,
      writable: true,
    });
  }

  // Array.prototype.flatMap Polyfill
  if (!Array.prototype.flatMap) {
    const flatMapImpl = function <T, U>(
      this: T[],
      callback: (value: T, index: number, array: T[]) => U | U[],
    ): U[] {
      const mapped: (U | U[])[] = [];
      for (let i = 0; i < this.length; i++) {
        mapped.push(callback(this[i], i, this));
      }
      return mapped.flat(1) as U[];
    };
    safeDefine(Array.prototype, "flatMap", {
      value: flatMapImpl,
      configurable: true,
      writable: true,
    });
  }

  // Array.prototype.at Polyfill
  if (!Array.prototype.at) {
    safeDefine(Array.prototype, "at", {
      value: atPolyfill,
      configurable: true,
      writable: true,
    });
  }

  // Array.prototype.includes Polyfill
  if (!Array.prototype.includes) {
    const includesImpl = function <T>(this: T[], searchElement: T, fromIndex: number = 0): boolean {
      const len = this.length;
      let start = fromIndex;
      if (start < 0) start = Math.max(len + start, 0);
      for (let i = start; i < len; i++) {
        const current = this[i];
        if (current === searchElement) return true;
        // Handle NaN comparison
        if (typeof current === "number" && typeof searchElement === "number") {
          if (Number.isNaN(current) && Number.isNaN(searchElement)) return true;
        }
      }
      return false;
    };
    safeDefine(Array.prototype, "includes", {
      value: includesImpl,
      configurable: true,
      writable: true,
    });
  }

  // Array.from Polyfill
  if (!Array.from) {
    (Array as { from?: typeof Array.from }).from = function <T, U>(
      arrayLike: Iterable<T> | ArrayLikeObject<T>,
      mapFn?: (v: T, k: number) => U,
      thisArg?: unknown,
    ): (T | U)[] {
      const arr: (T | U)[] = [];
      const len = "length" in arrayLike ? arrayLike.length : 0;
      for (let i = 0; i < len; i++) {
        const value = (arrayLike as ArrayLikeObject<T>)[i];
        if (mapFn) {
          arr.push(thisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i));
        } else {
          arr.push(value);
        }
      }
      return arr;
    };
  }

  // Array.of Polyfill
  if (!Array.of) {
    (Array as { of?: typeof Array.of }).of = function <T>(...args: T[]): T[] {
      return args;
    };
  }
}

// ==================== String Polyfills ====================

function initializeStringPolyfills(): void {
  // String.prototype.at Polyfill
  if (!("at" in String.prototype)) {
    safeDefine(String.prototype, "at", {
      value: atPolyfill as (this: string, index: number) => string | undefined,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.replaceAll Polyfill
  if (!String.prototype.replaceAll) {
    const replaceAllImpl = function (
      this: string,
      searchValue: string | RegExp,
      replaceValue: string,
    ): string {
      if (typeof searchValue === "string") {
        return this.split(searchValue).join(replaceValue);
      }
      if (searchValue instanceof RegExp) {
        if (!searchValue.global) {
          throw new TypeError("replaceAll must be called with a global RegExp");
        }
        return this.replace(searchValue, replaceValue);
      }
      return this;
    };
    safeDefine(String.prototype, "replaceAll", {
      value: replaceAllImpl,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.includes Polyfill
  if (!String.prototype.includes) {
    const includesImpl = function (this: string, search: string, start: number = 0): boolean {
      const haystack = String(this);
      const needle = String(search);
      const from = Math.max(0, start);
      if (needle.length === 0) return true;
      if (from + needle.length > haystack.length) return false;
      for (let i = from; i <= haystack.length - needle.length; i++) {
        if (haystack.slice(i, i + needle.length) === needle) return true;
      }
      return false;
    };
    safeDefine(String.prototype, "includes", {
      value: includesImpl,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.startsWith Polyfill
  if (!String.prototype.startsWith) {
    const startsWithImpl = function (this: string, search: string, pos: number = 0): boolean {
      return this.slice(pos, pos + search.length) === search;
    };
    safeDefine(String.prototype, "startsWith", {
      value: startsWithImpl,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.endsWith Polyfill
  if (!String.prototype.endsWith) {
    const endsWithImpl = function (this: string, search: string, pos?: number): boolean {
      const len = pos ?? this.length;
      return this.slice(len - search.length, len) === search;
    };
    safeDefine(String.prototype, "endsWith", {
      value: endsWithImpl,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.padStart Polyfill
  if (!String.prototype.padStart) {
    const padStartImpl = function (
      this: string,
      targetLength: number,
      padString: string = " ",
    ): string {
      const length = Math.trunc(targetLength);
      const pad = padString;
      if (this.length >= length || pad.length === 0) {
        return String(this);
      }
      const remaining = length - this.length;
      let padding = pad;
      if (remaining > pad.length) {
        padding = pad.repeat(Math.ceil(remaining / pad.length));
      }
      return padding.slice(0, remaining) + String(this);
    };
    safeDefine(String.prototype, "padStart", {
      value: padStartImpl,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.padEnd Polyfill
  if (!String.prototype.padEnd) {
    const padEndImpl = function (
      this: string,
      targetLength: number,
      padString: string = " ",
    ): string {
      const length = Math.trunc(targetLength);
      const pad = padString;
      if (this.length >= length || pad.length === 0) {
        return String(this);
      }
      const remaining = length - this.length;
      let padding = pad;
      if (remaining > pad.length) {
        padding = pad.repeat(Math.ceil(remaining / pad.length));
      }
      return String(this) + padding.slice(0, remaining);
    };
    safeDefine(String.prototype, "padEnd", {
      value: padEndImpl,
      configurable: true,
      writable: true,
    });
  }

  // String.prototype.repeat Polyfill
  if (!String.prototype.repeat) {
    const repeatImpl = function (this: string, count: number): string {
      if (count < 0 || count === Infinity) {
        throw new RangeError("Invalid count value");
      }
      let repeatCount = Math.floor(count);
      const source = String(this);
      if (source.length === 0 || repeatCount === 0) {
        return "";
      }
      // Use efficient doubling algorithm
      let result = "";
      let base = source;
      while (repeatCount > 0) {
        if (repeatCount % 2 === 1) {
          result += base;
        }
        repeatCount = Math.floor(repeatCount / 2);
        if (repeatCount > 0) {
          base += base;
        }
      }
      return result;
    };
    safeDefine(String.prototype, "repeat", {
      value: repeatImpl,
      configurable: true,
      writable: true,
    });
  }
}

// ==================== Promise Polyfills ====================

function initializePromisePolyfills(): void {
  // Promise.allSettled Polyfill
  if (!Promise.allSettled) {
    (Promise as { allSettled?: typeof Promise.allSettled }).allSettled = function <T>(
      promises: Iterable<T | PromiseLike<T>>,
    ): Promise<PromiseSettledResult<Awaited<T>>[]> {
      return Promise.all(
        Array.from(promises).map((p) =>
          Promise.resolve(p)
            .then((value) => ({
              status: "fulfilled" as const,
              value,
            }))
            .catch((error_: unknown) => ({
              status: "rejected" as const,
              reason: error_,
            })),
        ),
      );
    };
  }

  // Promise.any Polyfill
  if (!("any" in Promise)) {
    (Promise as { any?: <T>(promises: Iterable<T | PromiseLike<T>>) => Promise<Awaited<T>> }).any =
      function <T>(promises: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>> {
        return new Promise((resolve, reject) => {
          const promiseArray = Array.from(promises);
          const errors: unknown[] = [];
          let rejected = 0;

          if (promiseArray.length === 0) {
            reject(new AggregateError([], "All promises were rejected"));
            return;
          }

          for (let i = 0; i < promiseArray.length; i++) {
            const index = i;
            Promise.resolve(promiseArray[i])
              .then(resolve)
              .catch((error_: unknown) => {
                errors[index] = error_;
                rejected++;
                if (rejected === promiseArray.length) {
                  reject(new AggregateError(errors as Error[], "All promises were rejected"));
                }
              });
          }
        });
      };
  }

  // AggregateError Polyfill
  if (typeof AggregateError === "undefined") {
    const polyfillGlobal = globalThis as PolyfillGlobalThis;
    class AggregateErrorPolyfill extends Error {
      errors: unknown[];
      constructor(errors: Iterable<unknown>, message?: string) {
        super(message);
        this.name = "AggregateError";
        this.errors = Array.from(errors);
      }
    }
    polyfillGlobal.AggregateError = AggregateErrorPolyfill;
  }
}

// ==================== Element Polyfills ====================

function initializeElementPolyfills(): void {
  // Element.prototype.matches Polyfill
  if (!Element.prototype.matches) {
    const legacyProto = Element.prototype as unknown as LegacyElementPrototype;
    Element.prototype.matches =
      legacyProto.msMatchesSelector ??
      legacyProto.webkitMatchesSelector ??
      Element.prototype.matches;
  }

  // Element.prototype.closest Polyfill
  if (!Element.prototype.closest) {
    const findClosest = (start: Element | null, selector: string): Element | null => {
      for (let current: Element | null = start; current; current = current.parentElement) {
        if (current.matches(selector)) return current;
      }
      return null;
    };

    Element.prototype.closest = function closestPolyfill(selector: string): Element | null {
      return findClosest(this, selector);
    };
  }

  // Element.prototype.remove Polyfill
  if (!Element.prototype.remove) {
    const removeImpl = function (this: Element): void {
      const parent = this.parentNode;
      if (!parent) return;
      const range = document.createRange();
      range.selectNode(this);
      range.deleteContents();
    };
    safeDefine(Element.prototype, "remove", {
      value: removeImpl,
      configurable: true,
      writable: true,
    });
  }

  // NodeList.prototype.forEach Polyfill
  if (!NodeList.prototype.forEach) {
    Object.defineProperty(NodeList.prototype, "forEach", {
      value: Array.prototype.forEach,
      configurable: true,
      writable: true,
    });
  }
}

// ==================== Number Polyfills ====================

function initializeNumberPolyfills(): void {
  // Number.isFinite Polyfill
  // Note: We use the global isFinite here because we're polyfilling Number.isFinite
  if (!Number.isFinite) {
    Number.isFinite = function (value: unknown): value is number {
      return typeof value === "number" && Number.isFinite(value);
    };
  }

  // Number.isNaN Polyfill
  if (!Number.isNaN) {
    Number.isNaN = function (value: unknown): value is number {
      return typeof value === "number" && Number.isNaN(value);
    };
  }

  // Number.isInteger Polyfill
  // Note: We use the global isFinite here because we're checking after Number.isFinite might be polyfilled
  if (!Number.isInteger) {
    Number.isInteger = function (value: unknown): value is number {
      return typeof value === "number" && Number.isFinite(value) && Math.floor(value) === value;
    };
  }
}

// ==================== Miscellaneous Polyfills ====================

function initializeMiscPolyfills(): void {
  const polyfillGlobal = globalThis as PolyfillGlobalThis;

  // queueMicrotask Polyfill
  if (typeof queueMicrotask !== "function") {
    polyfillGlobal.queueMicrotask = function (callback: () => void): void {
      Promise.resolve()
        .then(callback)
        .catch((e: unknown) => {
          setTimeout(() => {
            throw e;
          }, 0);
        });
    };
  }

  // AbortController Polyfill (partial)
  if (typeof AbortController === "undefined") {
    class PolyfillAbortController {
      readonly signal: AbortSignal;
      private _aborted: boolean = false;
      private _reason: Error | undefined = undefined;
      private _onabort: (() => void) | null = null;

      constructor() {
        const getAborted = () => this._aborted;
        const getReason = () => this._reason;
        const getOnAbort = () => this._onabort;
        const setOnAbort = (handler: ((this: AbortSignal, ev: Event) => unknown) | null) => {
          this._onabort = handler as (() => void) | null;
        };
        const throwIfAborted = () => {
          if (this._aborted) {
            throw this._reason ?? new Error("Aborted");
          }
        };

        this.signal = {
          get aborted() {
            return getAborted();
          },
          get reason() {
            return getReason();
          },
          get onabort() {
            return getOnAbort();
          },
          set onabort(handler: ((this: AbortSignal, ev: Event) => unknown) | null) {
            setOnAbort(handler);
          },
          throwIfAborted() {
            throwIfAborted();
          },
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() {
            return false;
          },
        } as AbortSignal;
      }

      abort(reason?: unknown): void {
        this._aborted = true;
        this._reason = (reason as Error) ?? new Error("Aborted");
        if (typeof this._onabort === "function") {
          this._onabort();
        }
      }
    }
    polyfillGlobal.AbortController = PolyfillAbortController as unknown as typeof AbortController;
  }

  // CustomEvent Polyfill for IE
  if (typeof CustomEvent !== "function") {
    function CustomEventPolyfill<T>(event: string, params?: CustomEventInit<T>): CustomEvent<T> {
      const eventParams = params ?? { bubbles: false, cancelable: false, detail: undefined };
      let evt: Event;
      try {
        evt = new Event(event, {
          bubbles: eventParams.bubbles ?? false,
          cancelable: eventParams.cancelable ?? false,
        });
      } catch {
        evt = document.createEvent("Event");
        const legacyInit = (
          evt as { initEvent?: (type: string, bubbles?: boolean, cancelable?: boolean) => void }
        ).initEvent;
        if (legacyInit) {
          legacyInit.call(
            evt,
            event,
            eventParams.bubbles ?? false,
            eventParams.cancelable ?? false,
          );
        }
      }
      Object.defineProperty(evt, "detail", {
        value: eventParams.detail as T,
        enumerable: true,
      });
      return evt as CustomEvent<T>;
    }
    CustomEventPolyfill.prototype = Event.prototype;
    polyfillGlobal.CustomEvent = CustomEventPolyfill as unknown as typeof CustomEvent;
  }

  // Feature detection warnings
  if (!("IntersectionObserver" in globalThis)) {
    console.warn("IntersectionObserver not supported. Some features may not work correctly.");
  }

  if (!("ResizeObserver" in globalThis)) {
    console.warn("ResizeObserver not supported. Some features may not work correctly.");
  }
}

// ==================== Exports ====================

/** Manually initialize polyfills if needed */
export function ensurePolyfills(): void {
  if (globalThis?.window !== undefined) {
    initializePolyfills();
  }
}

/** Check if ES6 features are supported */
export const supportsES6 = (): boolean => {
  try {
    new Function("(a = 0) => a");
    return true;
  } catch {
    return false;
  }
};

/** Check if async/await is supported */
export const supportsAsyncAwait = (): boolean => {
  try {
    new Function("async () => {}");
    return true;
  } catch {
    return false;
  }
};

/** Check if optional chaining is supported */
export const supportsOptionalChaining = (): boolean => {
  try {
    new Function("return {}?.foo");
    return true;
  } catch {
    return false;
  }
};

/** Check if nullish coalescing is supported */
export const supportsNullishCoalescing = (): boolean => {
  try {
    new Function("return null ?? 1");
    return true;
  } catch {
    return false;
  }
};

/** Check if private class fields are supported */
export const supportsPrivateClassFields = (): boolean => {
  try {
    new Function("class C { #x = 1 }");
    return true;
  } catch {
    return false;
  }
};
