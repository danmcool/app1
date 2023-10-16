const puppeteer = require('puppeteer');
const Tools = require('./tools');

var pdf = {};


function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

pdf.printPDF = async function (htmlTemplate, data) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    htmlTemplate.replace(/st(ring)/, function (match, capture) {
        return Tools.resolvePath(data, match);
    }); 
    
    const test_html = `<html><h3>Hello world!</h3><img src="http://localhost:3000/logo.jpg"></html>`;
    await page.goto(`data:text/html,${test_html}`, { waitUntil: 'networkidle0' });
    await page.pdf({ path: `${this.outputPath}/test-puppeteer.pdf`,
        format: 'A4', landscape: !data.isPortrait,
        margin: { top: '0.5cm', right: '1cm', bottom: '0.8cm', left: '1cm' }, printBackground: true });
    await browser.close();

    await page.goto('https://blog.risingstack.com', {waitUntil: 'networkidle0'});
    img.src = 'data:image/png;base64,' + base64_encode(imagePath);
    const pdf = await page.pdf({ format: 'A4' });
   
    await browser.close();
    return pdf
}

printPDF('<html><h3>Hello world!</h3><img src="http://localhost:3000/logo.jpg"></html>', {data:{value1:10}});

module.exports = pdf;
