# Remix Scoped

Safe, per-request scoped access to the loader and action parameters anywhere in your call chain. Based on the same strategies AWS Lambda uses to expose global log functions that are scoped per-request.

Don't like having to pass your `request` object into almost every function call? This will suit you.

This package was inspired by .Net's per-request scoped dependency injection lifecycle / PHP's per-request walled gardens.

## Installation

Install with npm / bun etc.

`npm install remix-scoped`

## How to use

1. Wrap the definition of your loader / action functions in the `scopedLoader` and `scopedAction` higher order functions
1. Call `scopedRequest()`, `scopedParams()` or `scopedContext()` when you need access to the values passed to your loader / actions

**Example**

```typescript
// -- your remix route file, e.g. _index.tsx
import { scopedLoader } from "remix-scoped";
import { getUser } from "./user";

export const loader = scopedLoader(async () => {
  const { username } = await getUser();
  return json({ username });
});

// -- user.ts
import { scopedRequest } from "remix-scoped";

export const getUser = async () => {
  const request = await scopedRequest();
  const userId; // get your userId from session etc.
  return await getUserFromDatabase(userId);
};
```

You can also use `isLoader` and `isAction` to determine whether you are running in the context of an action execution, or a loader execution.

## Gotchas

### Security

While scoped requests will protect you from accidentally allowing one user to access another user's request you can still introduce this vulnerability yourself by caching information in module-scoped variables. You could already make that mistake without this package - this package will not protect you from that mistake.

### Performance

TLDR: Performance may be a concern if you're nesting several `AsyncLocalStorage` contexts and handling a high volume of requests.

This package makes use of the `AsyncLocalStorage` API available in NodeJS / Bun etc. Benchmarks have shown that nesting multiple `AsyncLocalStorage` contexts within each other can produce a performance bottleneck.

This may be a concern if for example you are run remix via AWS lambda, which already wraps your Lambda function in an `AsyncLocalStorage` context, and you also create your own additional contexts. Read more [here](https://eytanmanor.medium.com/should-you-use-asynclocalstorage-2063854356bb).
