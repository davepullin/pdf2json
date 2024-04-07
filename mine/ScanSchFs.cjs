const { dir } = require('console');
const fs = require('fs/promises');
const parseSchF = require("./parseSchF.cjs").parseSchF
// const pdfParserPromise = require("./parseSchF.cjs").pdfParserPromise
// const convert = require('./file-convert.js');
const base_path = '/s/repo/documents/accounting/'

async function yearloop() {
    const schf_data = {}
    for (year = 2007; year < 2024; year++) {
        let dirPath = base_path + year + "/returns/"
        try {
            const files = (await fs.readdir(dirPath))
                .filter(file => file.toLowerCase().endsWith('.pdf'))
                .filter(file => file.toLowerCase().includes('easihorse'))
                .filter(file => !file.toLowerCase().includes('farms'))
                .filter(file => !file.toLowerCase().includes('-p'))
                .filter(file => !file.toLowerCase().includes('k1'))
                .filter(file => !file.toLowerCase().endsWith('old.pdf'))
                .filter(file => !file.toLowerCase().includes('check'))
                // .filter(file => !file.toLowerCase().includes(' nc '))
                .filter(file => !file.toLowerCase().includes('accepted'))
                .filter(file => !file.toLowerCase().includes('pre correction'))
                .filter(file => !file.toLowerCase().endsWith(' nc.pdf'))
                .filter(file => !(year === 2010 && file.toLowerCase().includes('1065')))
                .filter(file => !file.toLowerCase().includes('2011.pdf')) // bad file Invalid XRef stream
            for (filename of files) {

                // console.log("parseSchF " + dirPath + filename);
                try {
                    const result = await parseSchF(dirPath + filename, false)
                    if (result) {
                        // console.log("parseSchF has schF file " + dirPath + filename);
                        Object.keys(result).forEach(k => {
                            schf_data[k] ||= {};
                            schf_data[k][year] = result[k];
                        })
                    } else {
                        console.error("parseSchF NO SchF file " + dirPath + filename);
                    }
                }
                catch (err) {
                    console.error("parseSchF error file " + dirPath + filename, err);
                }
            };
        } catch (err) {
            console.error("parseSchF error dir " + dirPath, err);
        }
    }
    const before = JSON.parse(JSON.stringify(schf_data));
    console.log(before)
    Object.keys(schf_data).forEach(title => {
        const amounts = Object.values(schf_data[title]).map(v => v.amount)
        const duplicated_amounts = amounts.filter((a, index) => amounts.slice(index + 1).findIndex(b => a === b) !== -1)
        duplicated_amounts.forEach(a => {
            Object.keys(schf_data[title]).filter(year => schf_data[title][year].amount === a).forEach(year => delete schf_data[title][year])
        })
    })
    console.log("trimmed", schf_data)
    await fs.writeFile("/s/repo/pdf2json/mine/schf_data.js", JSON.stringify(schf_data,null,2));
    // Object.keys(schf_data).forEach(k=>{
    //     console.log(k,before[k],schf_data[k])
    // })

    // Object.keys(schf_data).forEach(title => {
    //     console.log(title+"\t:"+Object.keys(schf_data[title]).length,schf_data[title])
    // })

    // eliminated completely undefined title

    console.log(" ")
    const keys=Object.keys(schf_data)
    keys.sort()
    const text = (keys.map(title =>
        'xlat["' + title + '"]="' + title + '" // ' + Object.keys(schf_data[title]).join(", ")+"\n")
    ).join("")
    console.log(" ")
    
    await fs.writeFile("/s/repo/pdf2json/mine/xlatnew.cjs", text);
    console.error("ending")
}


console.error("starting")

yearloop()
// parseSchF("/s/repo/documents/accounting/2011/returns/EasiHorse LLC 1065 for 2011printed.pdf",true)
console.error("ending")
exports.yearloop = yearloop;