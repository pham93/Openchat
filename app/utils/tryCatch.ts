export type Success<T> = {
  result: T;
  error?: never;
};

export type Failure<E> = {
  result?: never;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

type MaybePromise<T> = T | Promise<T>;

export function tryCatch<T, E = Error>(arg: () => T): Result<T, E>;
export function tryCatch<T, E = Error>(
  arg: () => Promise<T>
): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(arg: Promise<T>): Promise<Result<T, E>>;

export function tryCatch<T, E = Error>(
  arg: Promise<T> | (() => MaybePromise<T>)
): Promise<Result<T, E>> | Result<T, E> {
  if (typeof arg === "function") {
    try {
      const result = arg();
      return result instanceof Promise ? tryCatch(result) : { result: result };
    } catch (error) {
      return { error: error as E };
    }
  }

  return arg.then((e) => ({ result: e })).catch((e) => ({ error: e }));
}
