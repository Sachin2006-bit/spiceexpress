const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractPdfText() {
  try {
    const dataBuffer = fs.readFileSync('temp/2026031701 (2).pdf');
    const data = await pdfParse(dataBuffer);

    fs.writeFileSync('temp/extracted_text.txt', data.text);
    console.log('Successfully extracted text to temp/extracted_text.txt');
  } catch (err) {
    console.error('Error reading PDF:', err);
  }
}

extractPdfText();
