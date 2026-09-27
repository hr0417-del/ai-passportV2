const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

// Match pattern: [id, [title, mimeType, ...]]
// In Drive HTML payload, files are structured like: ["FILE_ID",["FILENAME", ...]]
const fileMatches = html.match(/\[\"(1[a-zA-Z0-9_\-]{32})\",\[\"([^\"]+)\"/g) || [];

console.log('File matches count:', fileMatches.length);
fileMatches.forEach(m => console.log(m));

// Let's also regex search for any drive file IDs: 1[a-zA-Z0-9_\-]{32}
const allDriveIds = Array.from(new Set(html.match(/1[a-zA-Z0-9_\-]{32}/g) || []));
console.log('All Drive IDs found:', allDriveIds);
