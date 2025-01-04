import {
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
// This MUST be import type, if we just import AsyncLocalStorage we break the browser bundle
import { type AsyncLocalStorage } from "node:async_hooks";

export interface RemixRequestScope {
  // Differentiating loader args vs. action args feels a little silly
  // Under the hood the typings are exactly the same
  // But remix treats them as separate things that are coincidentally the same, so I will too
  loaderArgs: LoaderFunctionArgs | undefined;
  actionArgs: ActionFunctionArgs | undefined;
}

let scopeStorage: AsyncLocalStorage<RemixRequestScope> | undefined = undefined;

const getScopeStorage = async () => {
  if (scopeStorage === undefined) {
    // This must be an asynchronous import, otherwise we break the browser bundle
    const async_hooks = await import("node:async_hooks");
    scopeStorage = new async_hooks.AsyncLocalStorage<RemixRequestScope>();
  }
  return scopeStorage;
};

export const scopedLoader = <T extends LoaderFunction>(loader: T): T => {
  if (typeof loader !== "function") {
    throw new Error(
      "remix-scoped Argument exception: Please provide a loader to scope."
    );
  }
  // We're already in a hoc, but we need to go one level deeper to
  // prevent unwanted module-scoped side-effects.
  // This allows this function to be called as a no-op in the browser.
  const higherOrderLoader: LoaderFunction = async (args) => {
    const storage = await getScopeStorage();
    return storage.run(
      { loaderArgs: args, actionArgs: undefined },
      async () => {
        const store = storage.getStore();
        if (!store?.loaderArgs)
          throw new Error("Should have loader args in the loader scope");
        return loader(store.loaderArgs);
      }
    );
  };
  return higherOrderLoader as T;
};

export const scopedAction = <T extends ActionFunction>(loader: T): T => {
  if (typeof loader !== "function") {
    throw new Error(
      "remix-scoped Argument exception: Please provide a loader to scope."
    );
  }
  // We're already in a hoc, but we need to go one level deeper to
  // prevent unwanted module-scoped side-effects.
  // This allows this function to be called as a no-op in the browser.
  const higherOrderAction: ActionFunction = async (args) => {
    const storage = await getScopeStorage();
    return storage.run(
      { loaderArgs: undefined, actionArgs: args },
      async () => {
        const store = storage.getStore();
        if (!store?.actionArgs)
          throw new Error("Should have loader args in the loader scope");
        return loader(store.actionArgs);
      }
    );
  };
  return higherOrderAction as T;
};

export const scopedRequest = async (): Promise<Request> => {
  const store = (await getScopeStorage()).getStore();
  let request: Request | undefined = undefined;
  if (store?.loaderArgs) {
    request = store.loaderArgs.request;
  }
  if (store?.actionArgs) {
    request = store.actionArgs.request;
  }
  if (!request) {
    throw new Error(
      "remix-scoped Runtime exception: Tried to get request, but no request in scope"
    );
  }

  return request;
};

export const scopedContext = async (): Promise<AppLoadContext> => {
  const store = (await getScopeStorage()).getStore();
  let context: AppLoadContext | undefined = undefined;
  if (store?.loaderArgs) {
    context = store.loaderArgs.context;
  }
  if (store?.actionArgs) {
    context = store.actionArgs.context;
  }
  if (!context) {
    throw new Error(
      "remix-scoped Runtime exception: Tried to get app context, but no app context in scope"
    );
  }

  return context;
};

// Weirdly remix doesn't export this type like it does most of its others
type Params = LoaderFunctionArgs["params"];
export const scopedParams = async (): Promise<AppLoadContext> => {
  const store = (await getScopeStorage()).getStore();
  let params: Params | undefined = undefined;
  if (store?.loaderArgs) {
    params = store.loaderArgs.params;
  }
  if (store?.actionArgs) {
    params = store.actionArgs.params;
  }
  if (!params) {
    throw new Error(
      "remix-scoped Runtime exception: Tried to get params, but no params in scope"
    );
  }

  return params;
};

export const isLoader = async () => {
  const store = (await getScopeStorage()).getStore();
  return !!store?.loaderArgs;
}

export const isAction = async () => {
  const store = (await getScopeStorage()).getStore();
  return !!store?.actionArgs;
}
