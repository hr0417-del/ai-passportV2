const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/drive/folders/1YcVPjR6iKGZ4itsuODDNEKOjwpnu5Y0x';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch/drive_certs_page.html', html);
    console.log('Saved html. Size:', html.length);

    // Extract all Drive file IDs
    const allDriveIds = Array.from(new Set(html.match(/1[a-zA-Z0-9_\-]{32}/g) || []));
    console.log('All Drive IDs found count:', allDriveIds.length);
    console.log('Drive IDs:', allDriveIds);

    // Search for titles or filenames
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('Folder Title:', titleMatch ? titleMatch[1] : 'No title');
  });
}).on('error', (e) => {
  console.error('Error:', e);
});
