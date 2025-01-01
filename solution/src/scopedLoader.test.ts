import { scopedLoader, scopedRequest } from "./scopedLoader"
import test, { describe } from "node:test";
import assert from "node:assert";
const dummyLoader = scopedLoader(async ({ request }: { request: Request}) => {
    let requestFromScope = await scopedRequest();
    const timeout = Number(new URL(requestFromScope.url).searchParams.get("timeout"));
    await delay(timeout);

    // We have to get it from scope again, otherwise we're just dealing with a local
    // copy of the data which won't prove anything
    requestFromScope = await scopedRequest();
    const testValue = requestFromScope.headers.get("x-test-value");
    console.log("testValue", testValue)
    return testValue;
});

function delay(timeout: number) {
   return new Promise<undefined>(function(resolve) {
       setTimeout(function() {
           resolve(undefined);
       }, timeout);
   });
}

describe("scoped requests", () => {
  test("do not suffer from race conditions", async () => {
    const slowFirstRequest = {
        url: 'http://www.test.com?timeout=2000',
        headers: new Headers({
            "x-test-value": "slowFirstRequest"
        })
    } as Request;
    const fastSecondRequest = {
        url: 'http://www.test.com?timeout=50',
        headers: new Headers({
            "x-test-value": "fastSecondRequest"
        })
    } as Request;
    const firstPromise = dummyLoader({ request: slowFirstRequest });
    await delay(50);
    const secondPromise = dummyLoader({ request: fastSecondRequest });
    const [firstResponse, secondResponse] = await Promise.all([firstPromise, secondPromise]);

    assert.equal(firstResponse, "slowFirstRequest");
    assert.equal(secondResponse, "fastSecondRequest");
  })
});