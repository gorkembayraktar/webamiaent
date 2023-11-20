import { get } from '../core/request.js';
import jsdom  from "jsdom";

const { JSDOM } = jsdom;

export const getDocument = async (url, headers = {}) => {
    const response = await get(
        url,
        headers
    );

    if(response.status !== 200)
        return null;
    
    const dom = new JSDOM(response.data);

    return dom.window.document;
}
