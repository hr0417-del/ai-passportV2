const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

// Search for any occurrence of "folder", "certificate", "cert", or item titles
const jsonChunks = html.match(/AF_initDataCallback\((.*?)\);/gs) || [];

console.log('AF_initDataCallback count:', jsonChunks.length);

jsonChunks.forEach((chunk, i) => {
  if (chunk.includes('folder') || chunk.includes('Cert') || chunk.includes('pdf') || chunk.includes('png')) {
    console.log(`\n--- Chunk ${i} matches key terms ---`);
    // extract strings
    const strList = chunk.match(/"([^"]{3,100})"/g) || [];
    const filtered = strList.map(s => s.replace(/"/g, '')).filter(s => 
      !s.startsWith('http') && 
      !s.startsWith('//') && 
      !s.includes('google') && 
      !s.includes('drive') && 
      s.length > 3
    );
    console.log(Array.from(new Set(filtered)).slice(0, 50));
  }
});
