import { scopedRequest } from "remix-scoped";
export const urlPrinter = async () => {
  const request = await scopedRequest();
  return request.url;
};
