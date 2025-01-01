import { ActionFunctionArgs, LoaderFunctionArgs, type LoaderFunction } from "@remix-run/node";
export interface RemixRequestScope {
    loaderArgs: LoaderFunctionArgs | undefined;
    actionArgs: ActionFunctionArgs | undefined;
}
export declare const scopedLoader: <T extends LoaderFunction>(loader: T) => T;
export declare const getRequest: () => Promise<Request>;
//# sourceMappingURL=scopedLoader.d.ts.map