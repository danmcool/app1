var puppeteer = require('puppeteer');
var crypto = require('crypto');
var fs = require('fs');
var Tools = require('./tools');

var SecretKey = process.env.APP1_SECRET_KEY;
// Make sure Constants is defined! I assume it's required somewhere like this:
// var Constants = require('./constants');

var print = {};

// 1. Refactored to return a Promise and correctly collect stream chunks
function base64_encode_async(file) {
    return new Promise((resolve, reject) => {
        // Fixed undefined 'file' variable issue (make sure to pass the full object, not just ID)
        var readStream = fs.createReadStream('./files/' + file._company_code + '/' + file._id);
        var chunks = [];

        readStream.on('error', function (err) {
            reject('File read error: ' + err.message);
        });

        // Note: crypto.createDecipher is deprecated. Consider upgrading to createDecipheriv.
        var decrypt = crypto.createDecipher(Constants.FilesCryptingAlgorithm, SecretKey);
        
        decrypt.on('error', function (err) {
            reject('Decryption error: ' + err.message);
        });

        // Pipe stream, collect data chunks, and resolve as base64
        readStream.pipe(decrypt)
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => {
                var buffer = Buffer.concat(chunks);
                resolve(buffer.toString('base64'));
            });
    });
}

// Helper to allow async/await inside String.replace
async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

// 2. Global browser instance, but local pages
var browserInstance;
puppeteer.launch({ headless: "new", args: ['--no-sandbox'] }).then(async browser => {
    browserInstance = browser;
});

print.createPdf = async function (htmlTemplate, data, userSession, landscape) {
    if (!browserInstance) {
        throw new Error("Puppeteer browser is not ready yet.");
    }

    const dataPreparedTemplate = htmlTemplate.replace(/<app1_([a-z0-9._]+)>/g, function (match, capture) {
        return Tools.resolvePathUndefValue(data, capture, '');
    });

    const userPreparedTemplate = dataPreparedTemplate.replace(/<app1user_([a-z0-9._]+)>/g, function (match, capture) {
        return Tools.resolvePathUndefValue(userSession, capture, '');
    });

    // Fixed missing closing quote on src
    const signaturePreparedTemplate = userPreparedTemplate.replace(/<app1sign_([a-z0-9._]+)>/g, function (match, capture) {
        return '<img src="' + Tools.resolvePathUndefValue(data, capture, '') + '" width="300" height="300">';
    });

    // 3. Using the async replacer to handle the promises from base64 encoding
    const imagePreparedTemplate = await replaceAsync(signaturePreparedTemplate, /<app1image_([a-z0-9._]+)>/g, async function (match, capture) {
        var images = Tools.resolvePathUndefValue(data, capture, []);
        if (!Array.isArray(images)) images = []; // Safe fallback
        
        var htmlImages = '<br>';
        for (var i = 0; i < images.length; i++) {
            try {
                // Fixed syntax errors and passing the full image object
                let base64data = await base64_encode_async(images[i]);
                htmlImages += '<img src="data:' + images[i].type + ';base64,' + base64data + '" width="600" height="600"><br>';
            } catch (err) {
                console.error("Failed to load image:", err);
            }
        }
        return htmlImages;
    });

    // 4. Create a NEW page for this specific request to avoid concurrency collisions
    const page = await browserInstance.newPage();

    try {
        // 5. Use setContent instead of goto with data URIs to avoid URL length limits
        await page.setContent(imagePreparedTemplate, { waitUntil: 'networkidle0' });
        
        const pdf = await page.pdf({ 
            format: 'A4', 
            landscape: landscape,
            margin: { top: '0.5cm', right: '1cm', bottom: '0.8cm', left: '1cm' }, 
            printBackground: true 
        });
        
        return pdf;
    } finally {
        // Always close the page to free up memory
        await page.close();
    }
}

module.exports = print;
