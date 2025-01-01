import { ActionFunctionArgs, LoaderFunctionArgs, type LoaderFunction } from "@remix-run/node"
import { type AsyncLocalStorage } from 'node:async_hooks';

export interface RemixRequestScope {
    loaderArgs: LoaderFunctionArgs | undefined;
    actionArgs: ActionFunctionArgs | undefined;
}

let scopeStorage: AsyncLocalStorage<RemixRequestScope> | undefined = undefined;

const getScopeStorage = async () => {
    if (scopeStorage === undefined) {
        const async_hooks = await import("node:async_hooks");
        scopeStorage = new async_hooks.AsyncLocalStorage<RemixRequestScope>();
    }
    return scopeStorage;
}

export const scopedLoader = <T extends LoaderFunction>(loader: T): T => {
    if (typeof loader !== "function") {
        throw new Error("remix-scoped Argument exception: Please provide a loader to scope.")
    }
    // We're already in a hoc, but we need to go one level deeper to
    // prevent unwanted module-scoped side-effects.
    // This allows this function to be called as a no-op in the browser.
    const higherOrderLoader: LoaderFunction = async (args) => {
        const storage = await getScopeStorage();
        return storage.run({loaderArgs: args, actionArgs: undefined}, async () => {
            const store = storage.getStore();
            if (!store?.loaderArgs) throw new Error("Should have loader args in the loader scope");
            return loader(store.loaderArgs);
        });
    }
    return higherOrderLoader as T;
}

export const getRequest = async (): Promise<Request> => {
    const store = (await getScopeStorage()).getStore();
    let request: Request | undefined = undefined;
    if (store?.loaderArgs) {
        request = store.loaderArgs.request;
    }
    if (store?.actionArgs) {
        request = store.actionArgs.request;
    }
    if (!request) {
        throw new Error("remix-scoped Runtime exception: Tried to get request, but no request in scope");
    }

    return request;
}
