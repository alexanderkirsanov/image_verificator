const fs = require('fs');
const fileName = process.argv[2];
var imageType = require('image-type');
const https = require('https');
const http = require('http');

console.log(fileName);
fs.readFile(fileName, 'utf8', (err, data) => {
    const json = data.split('\n');
    const fileWriter = fs.createWriteStream('incorrect.txt');
    const correctImages = fs.createWriteStream('correct.txt');
    json.forEach(file=> {
        const ex = file.indexOf('https://') !== -1 ? https : http;
        try {
            ex.get(file, (res) => {
                res.once('data', function (chunk) {
                    res.destroy();
                    const type = imageType(chunk);
                    if (!type) {
                        fileWriter.write(JSON.stringify({file: file, error: 'not image'}) + '\n');
                    } else {
                        correctImages.write(JSON.stringify({file: file, type: type}) + '\n');
                    }
                });
            }).on('error', function (e) {
                fileWriter.write(JSON.stringify({file: file, error: 'network_error', message: e.message}) + '\n');
            });
        } catch (e) {
            fileWriter.write(JSON.stringify({file: file, error: 'network_error_general', message: e.message}) + '\n');
        }
    });
    fileWriter.end();
    correctImages.end();
});
