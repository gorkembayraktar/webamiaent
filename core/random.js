export const token = (max = 10) => {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000)
          .toString(36).substr(0, max)
}

export const generate_token = (length) => {
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}