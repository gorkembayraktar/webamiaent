import { promisify } from 'util';
import { exec, spawn   } from 'child_process';

const asyncExec = promisify(exec);

async function main() {
    try {
   
        const { stdout, stderr } = await asyncExec('npm ls').catch(data => data);

        if (!stderr || !stderr.includes('npm ERR! missing')) {
            await startApp();
        } else {
            console.log('Gerekli paketler yükleniyor...');
            await asyncExec('npm install');
            console.log('Gerekli paketler başarıyla yüklendi.');
            await startApp();
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
    }
 
}


function startApp() {
    console.log('Uygulama başlatılıyor...');
    const appProcess = spawn('node', ['app'], { stdio: 'inherit' });

    return new Promise((resolve, reject) => {
        appProcess.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Uygulama başlatılırken hata oluştu. Çıkış kodu: ${code}`));
            }
        });
    });
}


// Ana işlemi başlat
main();