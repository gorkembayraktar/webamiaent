import { deleteFile, existsFile, getFile, saveFile } from "./file.js";
import {token} from './random.js';
import { settings, STORE_DATA, EXPORT_FOLDER } from "../common/settings.js";

export {
    settings,
    STORE_DATA,
    EXPORT_FOLDER
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