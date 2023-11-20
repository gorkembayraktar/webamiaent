import { get, post } from '../core/request.js';
import  commonApi from '../common/api.js';

const { login: loginApi, loginPost, priceavail, searchApi, searchHtml, searchCounter } = commonApi;

import { getDocument } from '../core/dom.js';
import { saveCookie, existsCookie, getCookie, appendFile } from '../core/file.js';

import {settings} from '../core/settings.js';

const { cookie_is_enable, max_allowed_records, lettersArray, max_allowed_per, max_priceavail, store, categories } = settings;

import AENT from './aent.js';
import { groupData } from '../core/array.js';

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




/*
(async function(login){
    const data = {
        username: process.env.AENT_USERNAME,
        password: process.env.AENT_PASSWORD,
        ship: process.env.AENT_SHIP ?? '',
        consumerMode: process.env.AENT_CONSUMERMODE ?? false
    }
    const result = await login(
        data.username, 
        data.password,
        data.ship,
        data.consumerMode
    );
    
 

    const aent = new AENT(data.username);

    for(let e of Object.entries(categories)){
        const mode = e[1];
        const result = await aent.getTotalCount(
            searchCounter(mode)
        );

        console.log(result);
        if(!result) continue;
        if(result.total > max_allowed_records){
            let t = 0;

            for(let item of lettersArray){
                const r = await aent.getTotalCount(
                    searchCounter(mode, '',item)
                );
                console.log(mode, item, r);
                if(r){
                    const max = Math.min( r.total, max_allowed_records );
                    const maxPage = Math.ceil(max / max_allowed_per);
                    for(let page = 1; page <= maxPage; page++){
                        let output = await aent.parseListData(
                            searchApi(
                                mode,
                                item,
                                '',
                                page
                            )
                        );
                        if(output){
                            
                            let group = groupData(output, max_priceavail);
                            for(let g = 0; g < group.length; g++){
                                console.log("group data alınıyor");
                                let priceData = await aent.getPriceAvail(
                                    group[g]
                                );
                                if(priceData){
                                    for(let k = 0; k < group[g].length; k++){
                                        group[g][k].price = priceData[k];
                                    }
                                }
                            }
                            
                            appendFile( store.upc, output.map(o => o.upc).join(' '));
                            output.forEach(item => {
                                appendFile( store.list , JSON.stringify(item));
                            });

                          
                        }
                        
        
                    }
                }
            }

        }else{
            const maxPage = Math.ceil(result.total / max_allowed_per);
            const allData = [];
            for(let page = 1; page <= maxPage; page++){
                let output = await aent.parseListData(
                    searchApi(
                        mode,
                        '',
                        '',
                        page
                    )
                );

                
                if(output){

                    let group = groupData(output, max_priceavail);
                    for(let g = 0; g < group.length; g++){
                        console.log("group data alınıyor");
                        let priceData = await aent.getPriceAvail(
                            group[g]
                        );
                        if(priceData){
                            for(let k = 0; k < group[g].length; k++){
                                group[g][k].price = priceData[k];
                            }
                        }
                    }
                    appendFile(store.upc, output.map(o => o.upc).join(' '));
                    output.forEach(item => {
                        appendFile(store.list, JSON.stringify(item));
                    });
                    allData.push(...output);
                }

                console.log(allData.length)
            }
        }
    }

})(login);


*/