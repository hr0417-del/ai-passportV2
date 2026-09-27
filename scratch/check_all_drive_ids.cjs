const https = require('https');

const ids = [
  '1oA3RIfDuaFBtBnbl6HhKbrFu47dNdtNP',
  '1_Oi0d8iAZMjTZh5IelRPMyh8vWgEcRS3',
  '164msPm-RXNiZV4WyJ0igHWzFFwiWoN0f',
  '1C8E_OCoauO1EpClT5eYFNRaJWRPBjA8Z',
  '1t9SyvTf78RxxV0HiW76KrlEwRUApEp8E',
  '1vOIT5nC4dBJBtgJ4Cpn555PFnQtbpVfr',
  '1FlJPdgjyDprK8FC3JUkSR3lKxFzLDSfr',
  '1syXFPlVtrt_jNxvYFx5ug_X5ByLOPc3N',
  '1baPZNvg6Kj6uzkX9EL7vrW5nbFt1V5ky',
  '1A3hfTAZR8gYG-edtotVY3zBUokPuZB9a',
  '1Zt-m5rAQYvLXX-fdvMB5AIVApEtyYdb_',
  '1p-GiNJCbt4iw-0NnQ-Q-5EJSuPJEsVeF',
  '1pwBClPMZ6eBRNbeFUgpg8M2rHv6W9atO',
  '1wPoHaOkkJXt0QYYpp1KG52FXvj30m_tU',
  '1YlnKAYH7NemArElTr02eeR6rE0DHQ69r',
  '1iNPxRqmj4nr-JHVtCNroptrVJsjUZXsq',
  '1KhfoMMmKBYsC0Yleq3D_7gnvQecK6XLS'
];

async function checkId(id) {
  return new Promise((resolve) => {
    const url = `https://drive.google.com/file/d/${id}/view`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1].replace(' - Google Drive', '') : 'Unknown';
        resolve({ id, title });
      });
    });
  });
}

async function run() {
  for (const id of ids) {
    const res = await checkId(id);
    console.log(`${res.id} -> ${res.title}`);
  }
}

run();
