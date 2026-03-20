const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("./extracted.json", JSON.stringify(pdfData, null, 2));
    console.log("Extraction successful and saved to extracted.json");
});

pdfParser.loadPDF("invoice format_spice express.pdf");
