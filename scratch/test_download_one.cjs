const https = require('https');
const fs = require('fs');

const fileId = '1aETsiShGWfpxIfUQou_LuEKI1mW2qLns'; // lavi.png
const url = `https://lh3.googleusercontent.com/d/${fileId}`;

https.get(url, (res) => {
  if (res.statusCode === 302 || res.statusCode === 301) {
    https.get(res.headers.location, (res2) => {
      const file = fs.createWriteStream('scratch/test_lavi_drive.png');
      res2.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Downloaded test lavi png! Size:', fs.statSync('scratch/test_lavi_drive.png').size);
      });
    });
  } else {
    const file = fs.createWriteStream('scratch/test_lavi_drive.png');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded test lavi png! Size:', fs.statSync('scratch/test_lavi_drive.png').size);
    });
  }
});
