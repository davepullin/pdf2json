// import fs from "fs";
const PDFParser = require("pdf2json");
const xlat = require("./xlat.cjs")
const name =
    // "Test pdf"
    // "F1040"
    // "EasiHorseLLC"
    // "EasiHorseLLC-SchF"
    // "2003 f1040sf filled"
    "2010EasiHorseLLC"
parseSchF("/s/repo/pdf2json/mine/" + name + ".pdf")

async function parseSchF(filename, header_only) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        const isAmountRegex = /^\d{1,3}(,\d{3})*$/;


        pdfParser.on("pdfParser_dataError", errData => {
            console.error("error in " + filename)
            // console.error(errData.parserError)
        });
        pdfParser.on("pdfParser_dataReady", data => {
            // fs.writeFile("/s/repo/pdf2json/mine/"+name+".json", JSON.stringify(data));
            let found_schf = false;
            const schf_data = {}
            // const just_list = []
            for (let page of data.Pages) {

                if (page.Fields.length > 0) {
                    console.log("has fields");
                    if (!header_only) {
                        page.Fields.forEach(f => { if (f.V) console.log(f.id.Id + ":" + f.V) })
                        console.log("end of fields");
                    }
                }
                // const string = JSON.stringify(page)
                // if (string.toLowerCase().includes('a'))
                //     console.log(JSON.stringify(page))

                if (page.Texts[0]?.R
                    && page.Texts[0].R.map(r => r.T).join('') === 'SCHEDULE%20F'
                ) {

                    console.log("found sch f: " + filename)
                    found_schf = true
                    if (header_only) {
                        resolve(true)
                        return
                    }
                    // const f = page.Texts.filter(t => t.R.map(r => r.T).join('') === '24b')
                    let blocks = page.Texts.map(t => t.R.map(r => r.T.split("%20").join(" ").split("%2C").join(",")).join(''))
                    blocks = blocks.map(b => {
                        b = b.trim().split(";").join("")
                        while (b.endsWith('.') || b.endsWith(" ")) { b = b.substring(0, b.length - 1) }
                        return b
                    }).filter(b => b)
                    // blocks=blocks.map(b=>{
                    //     let type="unknown: "
                    //     const isAmount = isAmountRegex.test(b)
                    //     if(!isAmount && b.length>3)
                    //         type="label"
                    //     else if(isAmount)
                    //         type="amount"


                    //     return type+": "+b})
                    let last_label = undefined
                    let last_amount = undefined
                    let last_index = undefined
                    let all = []

                    for (let b of blocks) {

                        // just_list.push(b)
                        let type = "unknown: "
                        const isAmount = isAmountRegex.test(b)
                        // if (b == '490') {
                        //     console.log("found")
                        // }
                        if (!isAmount && b.length > 3) {

                            if (last_label && last_amount) {
                                // console.log(last_label + "=" + last_amount)
                                const label = xlat.xlat[last_label] || last_label
                                // if (label !== last_label) {
                                //     console.log("xlat:" + last_label + "->" + label)
                                // }
                                schf_data[label] ||= {}
                                schf_data[label].amount = last_amount
                                schf_data[label].index = last_index
                                schf_data[label].all = all
                            }
                            type = "label"
                            if (last_amount || !last_label)
                                last_label = b
                            else
                                last_label ||= ' ' + b
                            if (last_label.length > 24)
                                last_label = last_label.substring(0, 24)
                            last_amount = undefined
                            last_index = undefined
                            all = []
                        }
                        else if (isAmount || !isNaN(b)) {
                            type = "amount"
                            if (last_amount) {
                                // two numbers. which is the amount? commas and large numbers are amounts
                                if (isNaN(b) || Number(b) > Number(last_amount)) {
                                    last_index = last_amount
                                    last_amount = b
                                } else {
                                    last_index = b
                                }
                            } else
                                last_amount = b;
                        }
                        all.push(b)
                        // console.log(b)
                    }
                    // console.log(blocks
                    //     .join('\n'))
                }
            }
            // console.log(just_list)
            resolve(found_schf && schf_data)
        })


        pdfParser.loadPDF(filename);

    })
}
// const nodeEvents = require('events')
// function pdfParserPromise(fileName) {
//     var promise = new nodeEvents.EventEmitter();

//     var pdfParser = new PDFParser();

//     pdfParser.on('pdfParser_dataReady', function (evtData) {
//        if (!!evtData && !!evtData.data) {
//           promise.emit('success', evtData.data);
//        } else {
//           promise.emit('error', new Error());
//        }
//     });

//     pdfParser.on('pdfParser_dataError', function (evtData) {
//        promise.emit('error', evtData.data);
//     });


//        pdfParser.loadPDF(fileName);


//     return promise;
//  }
exports.parseSchF = parseSchF;
//  exports.pdfParserPromise = pdfParserPromise;