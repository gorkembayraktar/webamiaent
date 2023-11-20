import figlet from 'figlet';


export const textDraw = (text) => {
    return  new Promise((r, j) => {
        figlet.text(text, function(err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                j(err);
                return;
            }
            console.log(data);
            setTimeout(() => {
                r();
            }, 100);
        });
    })
   
}