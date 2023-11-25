
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
        username: process.env.AENT_USERNAME ?? "",
        password: process.env.AENT_PASSWORD ?? "",
        ship: process.env.AENT_SHIP ?? '',
        consumerMode: process.env.AENT_CONSUMERMODE ?? false
    }
};