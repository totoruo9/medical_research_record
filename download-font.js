const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(path.join(dir, 'NotoSansKR-Regular.ttf'));
const request = https.get("https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR-Regular.ttf", function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => console.log("Download completed."));
    });
}).on('error', function (err) {
    fs.unlink(path.join(dir, 'NotoSansKR-Regular.ttf'));
    console.error("Error: " + err.message);
});
