import axios from 'axios';

import FormData  from 'form-data';


const request = async (url, method = 'GET' , headers = {}, body = []) => {

    const data = new FormData();

    const config = {
        method: method,
        url: url,
        maxRedirects: 0,
        maxBodyLength: Infinity
    };
    if(['POST','PUT', 'PATCH'].includes(method)){

        if(Array.isArray(body)){
            for(let formItem of body){
                if(formItem.key && formItem.value){
                    data.append(formItem.key, formItem.value);
                }
            }
        }
        config.data = data;
    }

    config.headers =  { 
        ...headers,
        ...data.getHeaders()
    };

    
    return axios(config)
    .then( 
        ({status, data, headers}) => {
            return {
                status,
                data,
                getCookies: () => {
                    const cookies = headers['set-cookie'];
                    return cookieParse(cookies);
                },
                json: () => {
                    
                    try{
                        if(Array.isArray(data))
                            return data;
                        
                        if(typeof data === 'Object')
                            return data;

                        return JSON.parse(data);
                    }catch(e){
                        return {
                            error: 'JSON not parsed',
                            detail: e.message 
                        };
                    }
                }
            }
        }

    ).catch(err => {
        const {status, data, headers} = err.response;
        return {
            status,
            data,
            getCookies: () => {
                const cookies = headers['set-cookie'];
                return cookieParse(cookies);
            }
        }
    });


}


const get = async (url, headers = {}) => {
    return request(url, 'GET', headers);
}

const post = async (url, body, headers = {}) => {
    return request(url, 'POST', headers, body);
}

const cookieParse = (set_cookies = []) => {
    if( ! (set_cookies instanceof Array)){
      return '';
    }
    let cookie = set_cookies.map(cookie => {
        const list = cookie.split(';');
        return list[0];
    }).filter((key,index,l)=>{
       return l.indexOf(key) == index
    })
    return cookie.join(';');
  }

  
export {
    request,
    get,
    post
}