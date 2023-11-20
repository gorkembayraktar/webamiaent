import { deleteFile, existsFile, getFile, saveFile } from "./file.js";
import {token} from './random.js';

export const STORE_DATA = 'store/data';

export const EXPORT_FOLDER = 'export';

export const settings = {
    lettersArray: 'abcdefghijklmnopqrstuvwxyz0123456789-,.!?;:'.split(''),
    max_allowed_records: 10000,
    max_allowed_per: 250,
    max_priceavail: 25,
    cookie_is_enable: process.env.COOKIE_ENABLE == 'true',
    requiredFields: {
        upc: 'upc.txt',
        list: 'list.txt',
        config: 'config.json'
    },
    store:{
        upc: (token) =>  `${STORE_DATA}/${token}/${settings.requiredFields.upc}`,
        list: (token) => `${STORE_DATA}/${token}/${settings.requiredFields.list}`,
        config: (token) => `${STORE_DATA}/${token}/${settings.requiredFields.config}`,
        info: `store/info.json`
    },
    categories:{
        "Upc/Cat": "UP",
        "Movies/Tv": "AV",
        "Movies/Tv Actor": "PE",
        "Movies/Tv Studio": "ST",
        "Movies/Tv Title": "TV",
        "Music": "AM",
        "Music Album": "MA",
        "Music Artist": "AR",
        "Music Artist (Lp Only)": "LPOnly",
        "Music Label": "LA",
        "Classical": "AC",
        "Classical Album": "CA",
        "Classical Person": "CP",
        "Classical Work": "WO",
        "Studio": "CY",
        "Video Games": "AG",
        "Video Games Title": "TG",
        "Accessories": "AA",
        "Apparel": "AAP",
        "Collectibles": "ACO",
    },
    login: {
        username: process.env.AENT_USERNAME,
        password: process.env.AENT_PASSWORD,
        ship: process.env.AENT_SHIP ?? '',
        consumerMode: process.env.AENT_CONSUMERMODE ?? false
    }
};

export const store = settings.store;

const MAX_TOKEN = 5;

export const config = {
    default: {
        name: '',
        created_at: Date.now(),
        token: token(MAX_TOKEN),
        continue: false,
        currentCategory: null,
        currentPage: 0,
        completed: false,
        selectedCategories: []
    },
    updateToken: (max = MAX_TOKEN) => {
        config.created_at = Date.now();
        config.default.token = token(max);
    },
    save: async function(json){
        saveFile(settings.store.config(config.default.token), JSON.stringify(json));
    },
    get: async function(token = null){
        if(token){
            config.default.token = token;
        }
        
        if(!existsFile(settings.store.config(config.default.token)))
            return config.default;
        try{
           const data =  await getFile(settings.store.config(config.default.token));
           return JSON.parse(data);
        }catch{
            return config.default;
        }
    },
    info_set: function(json){
        saveFile(settings.store.info, JSON.stringify(json));
    },
    info: async function(){
        if(!existsFile(settings.store.info))
            return null;
        try{
           const data =  await getFile(settings.store.info);
           const json = JSON.parse(data);
           config.default = {
                ...config.default,
                ...json
           };
         
           return config.get();
        }catch{
            return null;
        }
    },
    info_delete: function(){
        deleteFile(settings.store.info);
    }
};


export default settings;