import fs from 'fs';
import path from 'path';

export const existsCookie = (filename) => {
    return fs.existsSync( getCookiePath(filename) );
}

export const  getCookiePath = (filename) => {
    const folder = process.env.COOKIE_FOLDER ?? 'cookies';
    return `${folder}/${filename}.txt`;
}
export const getCookie = (filename) => {
    if(!existsCookie(filename)){
        return "";
    }
    return fs.readFileSync( getCookiePath(filename) );
}

export const saveCookie = async ( filename, cookie ) => {
    await fs.writeFileSync(getCookiePath(filename), cookie);
}

export const appendFile = async ( filename, text ) => {
    // Dosyanın var olup olmadığını kontrol et
    const dir = path.dirname(filename)
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir,  {recursive: true});
    }

    fs.appendFileSync(filename, text + '\n');
}

export const saveFile = async ( filename, text ) => {
    const dir = path.dirname(filename)
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});
    }
    fs.writeFileSync(filename, text);
}

export const existsFile = (filename) => {
    return fs.existsSync( filename );
}


export const getFile = async ( filename ) => {
    return fs.readFileSync( filename, { encoding: 'utf8', flag: 'r' });
}

export const deleteFile = async ( filename ) => {
    return fs.unlink(filename);
}