import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();
// const name = "Test pdf"
// const name = "F1040"
// const name = "EasiHorseLLC"
// const name = "EasiHorseLLC-SchF"
const name = "2003 f1040sf filled"
const isAmountRegex = /^\d{1,3}(,\d{3})*$/;
  

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", data => {
    // fs.writeFile("/s/repo/pdf2json/mine/"+name+".json", JSON.stringify(data));
    data.Pages.forEach((page, pnum) => {
        // console.log("page " + pnum + " " + page.Fields.length)
        if (page.Fields.length > 0)
            console.log("has fields")


        if (page.Texts[0].R.map(r => r.T).join('') === 'SCHEDULE%20F') {
            console.log("found sch f")
            // const f = page.Texts.filter(t => t.R.map(r => r.T).join('') === '24b')
            let blocks = page.Texts.map(t => t.R.map(r => r.T.split("%20").join(" ").split("%2C").join(",")).join(''))
            blocks = blocks.map(b => {
                while (b.endsWith('.') || b.endsWith(" ")) { b = b.substring(0, b.length - 1) }
                return b
            })
            // blocks=blocks.map(b=>{
            //     let type="unknown: "
            //     const isAmount = isAmountRegex.test(b)
            //     if(!isAmount && b.length>3)
            //         type="label"
            //     else if(isAmount)
            //         type="amount"
                

            //     return type+": "+b})
let last_label= undefined
let last_amount=undefined

            for(let b of blocks) {
                let type="unknown: "
                const isAmount = isAmountRegex.test(b)
                if(b=='490') {
                    console.log("found")
                }
                if(!isAmount && b.length>3) {
                    if(last_label && last_amount) {
                        console.log(last_label+"="+last_amount)
                    }
                    type="label"
                    last_label=b
                    last_amount=undefined
                }
                else if(isAmount || !isNaN(b)){
                    type="amount"
                    last_amount=b;
                }
                // console.log(b)
            }
            // console.log(blocks
            //     .join('\n'))
        }


    })



});

pdfParser.loadPDF("/s/repo/pdf2json/mine/" + name + ".pdf");