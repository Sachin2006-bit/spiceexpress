const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./extracted.json', 'utf8'));

let out = "";
data.Pages.forEach((page, idx) => {
    out += `--- Page ${idx + 1} ---\n`;
    page.Texts.forEach(t => {
        let str = t.R[0].T;
        try { str = decodeURIComponent(str); } catch (e) { /* keep raw */ }
        out += `x: ${t.x.toFixed(2)}, y: ${t.y.toFixed(2)} | str: ${str}\n`;
    });
});

fs.writeFileSync('./formatted.txt', out);
console.log("Done");
