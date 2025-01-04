import { type ActionFunctionArgs, type AppLoadContext, type LoaderFunctionArgs, type LoaderFunction, type ActionFunction } from "@remix-run/node";
export interface RemixRequestScope {
    loaderArgs: LoaderFunctionArgs | undefined;
    actionArgs: ActionFunctionArgs | undefined;
}
export declare const scopedLoader: <T extends LoaderFunction>(loader: T) => T;
export declare const scopedAction: <T extends ActionFunction>(loader: T) => T;
export declare const scopedRequest: () => Promise<Request>;
export declare const scopedContext: () => Promise<AppLoadContext>;
export declare const scopedParams: () => Promise<AppLoadContext>;
export declare const isLoader: () => Promise<boolean>;
export declare const isAction: () => Promise<boolean>;
//# sourceMappingURL=scopedLoader.d.ts.map