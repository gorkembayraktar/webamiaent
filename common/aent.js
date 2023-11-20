'use strict';

import { get, post } from '../core/request.js';
import { getCookie } from '../core/file.js';
import { getDocument } from '../core/dom.js';
import api from '../common/api.js';

const { priceavail } = api;

export class AENT {
    constructor(cust) {
        this.cust = cust;
        this.cookie = getCookie(cust);
    }

    updateCookie(){
        this.cookie = getCookie(this.cust);
    }

    async _get( url ){
        return get(
            url,
            {
                'Cookie': this.cookie
            }
        ) 
    }

    async _post( url, body ){
        return post(
            url,
            body,
            {
                'Cookie': this.cookie
            }
        ) 
    }


    
    async getTotalCount( url ){
        try{
            const response =  await this._get( url );
           

            const regex = /Items ([\d]+) - ([\d]+) of ([\d]+)/gm;

            const [_, first, last, total] = regex.exec(response.data);
      
            return {
                first: parseInt(first),
                last: parseInt(last),
                total: parseInt(total)
            };
        }catch{
            return false;
        }
    }

    async parseListData(url){
        try{
    
            const document =  await getDocument(
                url,
                {
                    'Cookie': this.cookie
                }
            );
                
            const li = document.querySelectorAll("li[data-upc]");
            const outmap = [...li].map(item =>{
                return {
                    upc: item?.getAttribute('data-upc'),
                    url: item?.querySelector('.aec-cover a')?.getAttribute('href'),
                    image: item?.querySelector('.aec-cover a img')?.getAttribute('data-src'),
                    title: item?.querySelector('.aec-cover a img')?.getAttribute('alt'),
                    price_text: item?.querySelector('.aec-webamiprice-display')?.textContent
                }
            });
            
            return outmap;
        }catch{
            return false;
        }
    }

    async getPriceAvail( dataGroup ){
        const upcs = dataGroup.map(i => i.upc).join('|');
        const response =  await this._post(
            priceavail,
            [{
                key: 'ids',
                value: upcs
            }]
        );
     
        if(response.status == 200){
            const json = response.json();
  
            if(json?.Error ){
                return  false;
            }
            
            return json;
        }
        return false;
    }

}

export default AENT;