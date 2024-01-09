var puppeteer = require('puppeteer');
var Tools = require('./tools');

var print = {};

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

var page;

puppeteer.launch({ headless: "new" }).then(async browser => {
    page = await browser.newPage();
});

print.createPdf = async function (htmlTemplate, data, userSession, landscape) {
    //const browser = await puppeteer.launch({ headless: "new" });
    //const page = await browser.newPage();
    const dataPreparedTemplate = htmlTemplate.replace(/<app1_([a-z0-9._]+)>/g, function (match, capture, offset, string, groups) {
        return Tools.resolvePath(data, capture);
    });
    const preparedTemplate = dataPreparedTemplate.replace(/<app1user_([a-z0-9._]+)>/g, function (match, capture, offset, string, groups) {
        return Tools.resolvePath(userSession, capture);
    });
    await page.goto(`data:text/html,${preparedTemplate}`, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', landscape: landscape,
        margin: { top: '0.5cm', right: '1cm', bottom: '0.8cm', left: '1cm' }, printBackground: true });
    //await browser.close();
/*
    await page.goto('https://blog.risingstack.com', {waitUntil: 'networkidle0'});
    img.src = 'data:image/png;base64,' + base64_encode(imagePath);
    const pdf = await page.pdf({ format: 'A4' });
*/
    return pdf;
}

module.exports = print;
