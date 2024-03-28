const fs = require('fs/promises');
const parseSchF = require("./parseSchF.cjs").parseSchF
// const convert = require('./file-convert.js');
const base_path='/s/repo/documents/accounting/'

async function yearloop(){
    for(year=2010; year<2020; year++) {
        await scan(base_path+year+"/returns/",parseSchF)
    }
}
/* find files in the directory and scan it by http to ... */
const scan = async (path,processor) => {
    try {
        const files = await fs.readdir(path);
        files.forEach(async(filename)=> {
            console.log("parseSchF "+path + "/" + filename);
            await processor(path+"/"+filename);
        });
    } catch (err) {
        console.error("XXFER",err);
    }
}

console.error("starting")
//scan("/data/temp/autoweb/xfer",(data)=>{console.log("processed:"+JSON.stringify(data))})
// Promise.all([scan("/data/temp/autoweb/xfer")]);
yearloop()
console.error("ending")
exports.yearloop = yearloop;