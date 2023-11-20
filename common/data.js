import { glob} from 'glob'
import moment from 'moment/moment.js';

moment.locale('tr');   

import settings, {STORE_DATA, config} from '../core/settings.js'
import { existsFile } from '../core/file.js';


export const getDataList = async () => {
    const directories = await (await glob(`${STORE_DATA}/*`, { withFileTypes: true })).filter(
        i => Object.entries(settings.requiredFields)
            .map(([key, field]) => existsFile(`${STORE_DATA}/${i.name}/${field}`))
            .every(i => i === true)
    ).map( async i =>{
        const data = await config.get(i.name);
        return {
            token: i.name,
            path: `${STORE_DATA}/${i.name}`,
            name: data.name,
            time: moment(data.created_at).fromNow()
        }
    });

    const data = await Promise.all(directories);

    return data;
}


export const getMinPrice = (data, price) => {
    try{
        if(data.TierPriceMaster && data.TierPriceMaster != '$0.00'){
            return data.TierPriceMaster;
        }else if(data.TierPriceBox && data.TierPriceBox != '$0.00'){
            return data.TierPriceBox;
        }else if(data.Price && data.Price != '$0.00'){
            return data.Price;
        }else{
            return price ?? '-';
        }
    }catch{
        return "0";
    }
}