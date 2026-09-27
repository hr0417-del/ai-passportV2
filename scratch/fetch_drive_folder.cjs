const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/drive/folders/1zEZGPEe4Gg1MmCaqrP9Vmo0FW9K6vRge?usp=sharing';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch/drive_page.html', html);
    console.log('Saved html. Size:', html.length);
    
    // Find all item titles / IDs pattern in Google Drive HTML
    const idNameMatches = html.match(/\[\"([0-9a-zA-Z_\-]{25,50})\",\[\"([^\"]+)\"\]/g);
    console.log('ID Name Matches count:', idNameMatches ? idNameMatches.length : 0);

    // Regex for file names (png, pdf, webp, jpg, jpeg)
    const fileNames = html.match(/[a-zA-Z0-9_\- ]+\.(png|pdf|jpg|jpeg|webp)/gi);
    console.log('Found filenames:', fileNames ? Array.from(new Set(fileNames)) : []);
  });
}).on('error', (e) => {
  console.error('Error:', e);
});
