import { getRequest } from 'remix-scoped'
export const urlPrinter = async () => {
    const request = await getRequest();
    return request.url;
}