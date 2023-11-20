import './core/config.js'

import fs from 'fs';
import xlsx from 'xlsx';
import { delay } from './core/dev.js';
import inquirer from 'inquirer';
import { textDraw } from './core/figlet.js';
import checkbox, { Separator } from '@inquirer/checkbox';
import settings, { EXPORT_FOLDER, config, store } from './core/settings.js'
import AENT from './common/aent.js';
import {login} from './common/actions.js';

import { appendFile, existsFile } from './core/file.js';

import commonApi from './common/api.js';

import { groupData } from './core/array.js';
import { getDataList, getMinPrice } from './common/data.js';
import slugify from 'slugify';

import path from 'path'
import child_process from 'child_process'

process.on('uncaughtException', function(err) {
    console.log(err.stack);
    throw err;
});


const { searchCounter, searchApi } = commonApi;

const startTime = Date.now();

console.clear();


const aent = new AENT( settings.login.username );

async function Main(){

    await textDraw("webami . aent");

    await Homepage();
};


async function Homepage(){
   const {islem} = await inquirer
    .prompt([
            {
                type:'list',
                message:'İşlem Seçimi :',
                name:'islem',
                choices:[
                    {name:"Veri Topla", value:'collect'},
                    {name:"Veriler", value:'data'},
                    new inquirer.Separator(),
                    {name:'Programı Kapat (Exit)', value:"close"}
                ]
            }
    ]);

    switch(islem){
       
        case 'collect':
            await Collect();
        break;
        case 'data':
            await DataList();
        break;



        case 'close':
            console.log("Toplam oturum : ", (Date.now() - startTime) / 1000, "saniye");
            process.exit();
        break;
    }

}

async function Collect(){
    
    const info = await config.info();
    const isContunie = info && info.continue && !info.completed;
    const {islem} = await inquirer
    .prompt([
            {
                type:'list',
                message:'İşlem Seçimi :',
                name:'islem',
                choices:[
                    {name:"Kaldığınız yerden devam edin", value:'cont'},
                    {name:"Kategori Seçin", value:'category'},
                    new inquirer.Separator(),
                    {name:'Geri Git', value:"back"}
                ].filter(f => {
                    if( (!isContunie && f.value == 'cont') ) return false;

                    return true;
                })
            }
    ]);
    if(islem == 'cont'){
        await Cont();
    }else if(islem == 'category'){
        await SelectCategory();
    }else{
        await Homepage();
    }
}

async function Cont(){

    const info = await config.info();

    if(!info){
        console.log("Devam eden bir işlem bulunamadı.");
        await Homepage();
        return;
    }

    const ui = new inquirer.ui.BottomBar();
    const isLogin = await login(
        settings.login.username, 
        settings.login.password,
        settings.login.ship,
        settings.login.consumerMode
    );
    if(!isLogin){
        ui.log.write("Giriş yapılamadı.");
        ui.close();
        return await Homepage();
    }

    let totalPage = 0;

    info.completed = false;
    info.continue = true;

    config.save(info);
  
    const selectedCategories = info.selectedCategories;
    let fi = selectedCategories.findIndex(f => f.value == info.currentCategory.value);

    for(let i = fi; i < selectedCategories.length ;i ++){ 
        const category = selectedCategories[i];
 
        const result = await aent.getTotalCount(
            searchCounter(category.value)
        );
        
        if(result){
            category.result = result;
            category.max = Math.min( result.total, settings.max_allowed_records);
            const maxPage = Math.ceil(category.max / settings.max_allowed_per);
            totalPage += maxPage;
        }

        ui.updateBottomBar(`Toplam kalan kayıt hesaplanıyor.. (${i + 1}/${selectedCategories.length})`);
    }


    let pageCounter = 0;
    for(let [i,category] of selectedCategories.entries()){
        if(i < fi){
            continue;
        }
        const l = selectedCategories.length;
        const maxPage = Math.ceil(category.max / settings.max_allowed_per);
        info.currentCategory = category;
        config.save(info);

        for(let page = info.currentPage + 1; page <= maxPage; page++){

            pageCounter++;

            ui.updateBottomBar(`${category.value} : (${page}/${maxPage}), genel yüzde: ${ pageCounter / totalPage * 100  }%`);

            let output = await aent.parseListData(
                searchApi(
                    category.value,
                    '',
                    '',
                    page
                )
            );
            if(output){
                let group = groupData(output, settings.max_priceavail);
                for(let g = 0; g < group.length; g++){
     
                    let priceData = await aent.getPriceAvail(
                        group[g]
                    );
                    if(priceData){
                        for(let k = 0; k < group[g].length; k++){
                            group[g][k].price = priceData[k];
                        }
                    }
                    ui.updateBottomBar(`${info.token}, ${ pageCounter / totalPage * 100 }% - Kategori (${i + 1}/${selectedCategories.length}),  Sayfa (${page}/${maxPage}), Ürün fiyat : (${g + 1}/${group.length})`);
                }
               
                try{
                    appendFile(store.upc(info.token), output.map(o => o.upc).join(' '));
                    output.forEach(item => {
                        appendFile(store.list(info.token), JSON.stringify(item));
                    });
                    info.currentPage = page;
                    config.save(info);

                }catch(e){
                    console.error(e)
                }
            
                
            }
        }
       
    } 

    info.completed = true;
    info.continue = false;

    config.save(info);

    config.info_delete();

    ui.log.write(`Tamamlandı`);
    ui.updateBottomBar('');
    ui.close();

    await Homepage();

    
}

async function SelectCategory(){
   
    const { islem } = await inquirer
    .prompt([
            {
                type:'text',
                message:'İşlem Adını Girin :',
                name:'islem'
            }
    ]); 
    
    const ui = new inquirer.ui.BottomBar();
    const isLogin = await login(
        settings.login.username, 
        settings.login.password,
        settings.login.ship,
        settings.login.consumerMode
    );
    if(!isLogin){
        ui.log.write("Giriş yapılamadı.");
        ui.close();
        return await Homepage();
    }
    // varsayılan değerleri al

    const rconfig = await config.get();

    rconfig.name = islem;
  

    const cate = Object.entries(settings.categories).map(([name, value]) => ({
        name, 
        value,
        checked: rconfig.selectedCategories.some(s => s.value == value)
    }));

    ui.updateBottomBar("Kategori toplam kayıtlar hesaplanıyor..");
    const aent = new AENT(settings.login.username);
    
    for(let i = 0; i < cate.length; i ++){
        const c = cate[i];
        const result = await aent.getTotalCount(
            searchCounter(c.value)
        );
        c.count = result ? result.total : -1;
        ui.updateBottomBar(`Kategori toplam kayıtlar hesaplanıyor..(${ ((i + 1) / cate.length ) * 100 }%)`);
    }
    
    const answer = await checkbox({
        message: 'Kategorileri Seçin',
        pageSize: 10,
        choices: cate.map(c => ({...c, value: c, name: `${c.name} (${c.count ?? 0})`})),
        required: true
     });

     config.updateToken();

     rconfig.token = config.default.token;
     rconfig.created_at = Date.now();
     rconfig.selectedCategories = answer;
     config.save(rconfig);
     config.info_set(rconfig);

     ui.updateBottomBar('');
     ui.close();

     await t();
}

async function t(){
    const ui = new inquirer.ui.BottomBar();
    const isLogin = await login(
        settings.login.username, 
        settings.login.password,
        settings.login.ship,
        settings.login.consumerMode
    );
    if(!isLogin){
        ui.log.write("Giriş yapılamadı.");
    }

    const rconfig = await config.get();
    let totalRecord = 0;
    let totalPage = 0;

    rconfig.completed = false;
    rconfig.continue = true;
    
    config.info_set(rconfig);
    config.save(rconfig);

    for(let i = 0; i < rconfig.selectedCategories.length ;i ++){ 
        const category = rconfig.selectedCategories[i];
 
        const result = await aent.getTotalCount(
            searchCounter(category.value)
        );
        if(result){
            category.result = result;
            category.max = Math.min( result.total, settings.max_allowed_records);
            const maxPage = Math.ceil(category.max / settings.max_allowed_per);
            totalPage += maxPage;
            totalRecord += category.max;
        }
        ui.updateBottomBar(`Toplam kayıt hesaplanıyor.. (${i + 1}/${rconfig.selectedCategories.length})`);
    };

    let pageCounter = 0;
    for(let [i,category] of rconfig.selectedCategories.entries()){
        const l = rconfig.selectedCategories.length;
        const maxPage = Math.ceil(category.max / settings.max_allowed_per);
        rconfig.currentCategory = category;
        config.save(rconfig);

        for(let page = 1; page <= maxPage; page++){

            pageCounter++;

            ui.updateBottomBar(`${category.value} : (${page}/${maxPage}), genel yüzde: ${ pageCounter / totalPage * 100  }%`);

            let output = await aent.parseListData(
                searchApi(
                    category.value,
                    '',
                    '',
                    page
                )
            );
            if(output){
                let group = groupData(output, settings.max_priceavail);
                for(let g = 0; g < group.length; g++){
     
                    let priceData = await aent.getPriceAvail(
                        group[g]
                    );
                    if(priceData){
                        for(let k = 0; k < group[g].length; k++){
                            group[g][k].price = priceData[k];
                        }
                    }
                    ui.updateBottomBar(`${rconfig.token}, ${ pageCounter / totalPage * 100 }% - Kategori (${i + 1}/${rconfig.selectedCategories.length}),  Sayfa (${page}/${maxPage}), Ürün fiyat : (${g + 1}/${group.length})`);
                }
               
                try{
                    appendFile(store.upc(rconfig.token), output.map(o => o.upc).join(' '));
                    output.forEach(item => {
                        appendFile(store.list(rconfig.token), JSON.stringify(item));
                    });
                    rconfig.currentPage = page;
                    config.save(rconfig);

                }catch(e){
                    console.error(e)
                }
            
                
            }
        }
       
    } 

    
    rconfig.completed = true;
    rconfig.continue = false;

    config.save(rconfig);

    config.info_delete();

    ui.log.write(`Tamamlandı`);

    ui.close();

    await Homepage();

   
}


async function DataList(){
    const dataList = await getDataList();

    if(dataList.length == 0){
        console.log("Kayıt bulunamadı.");
        await Homepage();
        return;
    }

    const { islem, cikti } = await inquirer.prompt([
                            {
                                type:'list',
                                message:`Geçmiş Kayıtlar:`,
                                name:'islem',
                                choices: dataList.map(d =>({ name: `${d.name} (${d.time})`, value: d }))
                            },
                            {
                                type:'list',
                                message:`Çıktı Al`,
                                name:'cikti',
                                choices: [
                                    ".txt",
                                    ".xlsx"
                                ]
                            }
    ]);
    const ui = new inquirer.ui.BottomBar();

    switch(cikti){
        case '.txt':

            let filename; 
            let file;
            let counter = 1;
            do{
                filename = slugify(`${islem.name} - ${islem.token}`)
                if(counter > 1){
                    filename  = filename + "-" + counter;
                } 
                file = EXPORT_FOLDER + "/" + filename + ".txt"; 
                counter++;
            }while(existsFile(file));


            ui.updateBottomBar('txt dosyasi hazırlanıyor');
            const lines = fs.readFileSync(
                settings.store.list(islem.token)
                , 'utf-8'
            ).split(/\r?\n/);
            lines.forEach(function(line, i ){
                try{
                    if(line.trim()){
                        let p = JSON.parse(line.trim());
                    
                        ui.updateBottomBar(`${(i + 1) / lines.length * 100 } %`);
                        appendFile(file,  `${p.upc}\t${getMinPrice(p.price, p.price_text)}\t${p.title}`)
                    }
                }catch(e){
                    //console.error(e);
                }
            })
            ui.log.write('Kaydedildi: '+file);
            ui.updateBottomBar('');
            const {out} = await inquirer.prompt([
                {
                    type:'confirm',
                    message:`Dosyayı açmak istiyor musunuz ? `,
                    name:'out'
                }]);

            if(out){
                let __dirname = path.resolve();
                child_process.exec(`start "" "${path.resolve(__dirname, file)}"`);
            }
        break;

        case '.xlsx':
            ui.updateBottomBar('xls dosyasi hazırlanıyor');
            // Reading our test file 
           
            let filename2; 
            let file2;
            let counter2 = 1;
            do{
                filename2 = slugify(`${islem.name} - ${islem.token}`)
                if(counter2 > 1){
                    filename2  = filename2 + "-" + counter2;
                } 
                file2 = EXPORT_FOLDER + "/" + filename2 + ".xlsx"; 
                counter2++;
            }while(existsFile(file2));


            // Sample data set 
            let datasetlines = fs.readFileSync(
                settings.store.list(islem.token)
                , 'utf-8'
            ).split(/\r?\n/);
            let dataset = datasetlines.map((line, i) => {
                try{
                    if(line.trim()){
                        let p = JSON.parse(line.trim());
                        ui.updateBottomBar(`${(i + 1) / datasetlines.length * 100 } %`);
                        return {
                            UPC: p.upc,
                            Price: getMinPrice(p.price, p.price_text),
                            Title: p.title
                        }
                    }
                }catch(e){
                    return null;
                }
            }).filter(k => k != null);
            
            let workBook = xlsx.utils.book_new();

            const ws = xlsx.utils.json_to_sheet(dataset) 
            
            xlsx.utils.book_append_sheet(workBook,ws,"Sheet") 
            
            // Writing to our file 
            xlsx.writeFile(workBook, file2) 
            ui.log.write('Kaydedildi: '+file2);
            ui.updateBottomBar('');
            const {out2} = await inquirer.prompt([
                {
                    type:'confirm',
                    message:`Dosyayı açmak istiyor musunuz ? `,
                    name:'out'
                }]);
            if(out2){
                let __dirname2 = path.resolve();
                child_process.exec(`start "" "${path.resolve(__dirname2, file2)}"`);    
            }

        break;
    }

    ui.log.write('Çıktı başarılı şekilde tamamlandı.');
    ui.updateBottomBar('');
    ui.close();

    await Homepage();
}

Main();
