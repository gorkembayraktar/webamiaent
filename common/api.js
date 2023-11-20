import settings from "../core/settings.js";

const max_allowed_per = settings.max_allowed_per;

export const api = {
    login: 'https://webami.aent.com/webami/logon?returnUrl=%2Fmusic',
    loginPost: 'https://webami.aent.com/account/logon?returnUrl=%2Fmusic',
    priceavail: 'https://webami.aent.com/ajax/priceavail',
    searchApi: (mod, q = '', sw = '', pagenum = 1, perpage = max_allowed_per ) => {
        return `https://webami.aent.com/catalog/getgrid?q=${q}&mod=${mod}&in=In+Stock&sw=${sw}&type=productsearch&sortCol=InStock&pageNum=${pagenum}&perPage=${perpage}`;  
    },
    searchCounter: (mod, q = '', sw = '', pagenum = 1, perpage = max_allowed_per ) => {
        return `https://webami.aent.com/search?q=${q}&mod=${mod}&in=In+Stock&sw=${sw}#!?pagenum=${pagenum}&perpage=${perpage}&sortby=InStock`;
    },
    
}

export default api;