export const groupData = (data, groupCount) => {
    let max = data.length;
    let newdata = [];
    for(let i = 0; i < Math.ceil(max / groupCount);  i++){
        for(let k = 0; k < groupCount; k ++){
            if(!newdata[i]) newdata[i] = [];
            if( i * groupCount + k < max){
                newdata[i].push(
                    data[
                        i * groupCount + k
                    ]
                );
            }
           
        }
    }
    return newdata;
}