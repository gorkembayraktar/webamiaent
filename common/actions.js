import { post } from '../core/request.js';
import  commonApi from '../common/api.js';

const { login: loginApi, loginPost, priceavail } = commonApi;

import { getDocument } from '../core/dom.js';
import { saveCookie, existsCookie, getCookie, appendFile } from '../core/file.js';

import {settings} from '../core/settings.js';

const { cookie_is_enable } = settings;


export const login = async (cust, pass, ship = '', consumerMode = false) => {
    if(cookie_is_enable && existsCookie( cust )){
        const cookie = getCookie(cust);
        if( cookie && isEnableCookie(cookie)  ){
            return true;
        }
    }
    const token = await getVerificationToken();
    const response = await post(
        loginPost,    
        [
            {key: '__RequestVerificationToken', value: token},
            {key: 'CustId', value: cust},
            {key: 'ShipToId', value: ship},
            {key: 'Password', value: pass},
            {key: 'ConsumerMode', value: consumerMode ? 'true' : 'false'}
        ]
    );
  
    if( response.status !== 302 ){
        return false;
    }
    const body = response.data;

    const invalidString = "Message=Invalid%20Username%20or%20Password";
    if( body.includes( invalidString ) ){
        return false;
    }

    const validString = "Object moved to";
    if( body.includes(validString) ){
        if(cookie_is_enable){
            saveCookie(cust.trim(), response.getCookies());
        }
        return true;
    }

    return false;
}

export const getVerificationToken = async () => {
    const doc = await getDocument(loginApi);
    if(!doc) return;
    
    return doc?.querySelector("[name=__RequestVerificationToken]")?.value;
}

export const isEnableCookie = async (cookie) => {
    const response = await post(
        priceavail,
        [
            {key: 'ids', value: '194735004881'}
        ],
        {
            'Cookie': cookie
        }
    );
    if(response.status == 200){
        const json = response.json();
        if(typeof json === 'object' ){
            if(json.Error){
                return false;
            }
        }
        if(Array.isArray(json)){
            return true;
        }
    }

    return false;
}

