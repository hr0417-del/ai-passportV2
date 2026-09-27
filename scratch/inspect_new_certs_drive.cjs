const https = require('https');
const fs = require('fs');

const driveIds = [
  '1VFQgyGng0yy6_B7ws0n7289-K-Ga4wid',
  '1VmeyTUt7z2pNdtFr5lx3edsNldxec1T2',
  '1ygiLcLZQyDn4iUfA1LuAzp3HEpcx0NPn',
  '1TINvYRO0dBMDPZFoXY7syJXUYcVfQCT8',
  '1ffPkoKVspWUNeJ71MG4hL6OgIaUF4_wi',
  '10ui_E4LxvlH3FATo-uFl8COgTiPYOLCZ',
  '1CvoAwUuf4f5-myjtJBlH-kThVxQIM4cl',
  '1MJwZNgwsVqVSdc89W4ZaYtOCsoxY0q_n',
  '1LOFFVW_4qKZPqLPCHgr3HiBNL6c6VmZM',
  '1IV1aFsQTXMYRT6tnS6HtIPa4WgoA8uDL',
  '1yL9gvFncGptfblrJV4IB75K0yr561FZl',
  '1y0_2wDl7oXv62Z0lJn_brm4elg5KVGxT',
  '1neBjJlPCOd4TvJHeId-D2MBfnobqn8mq',
  '1hzAUZKP7SRgKnEqRtg1QsuuKVHY9Dm5x',
  '1aETsiShGWfpxIfUQou_LuEKI1mW2qLns',
  '1XnlSN2lU8wxb9In-RSZsBHJss-Exib6Z',
  '1QiJkXQzhDsD2wj3eNOkWvwdPUXqYbNo5',
  '1NGHu0Gwr03MUKbFzQob6hIx-MHXcJ7lQ',
  '14TYCmZAz8l6e0mMTokegLNygmn0Gx_9a',
  '17uHKb_6yR1X7zkQoKz0_rkUzvgM-PP5a',
  '10enQnTNHHHn75VV3OjnoCt0k9hexkxe4',
  '1Ow3_zedYNaONQDvXWTnT5D4QMex_6Bbv',
  '1AW72mK-g5EVhzGpDKCttagrSj9q5ZZTT',
  '1_9rvF9kKeM2jNl8Ibz4Nq5RqqLiMa_a_',
  '1R6Vsw200m1-F25MwGTOkYiyaiSdGiKD-',
  '1dbD41DcRwCG08uX8N7dabAKrMc9pvppC',
  '1f1gzRx6Vb7QDgP7JGS6xsoeW-DMes7Rq',
  '13qQ2KEx6NyVFvAziAE8LxjWe87r6cwHv',
  '1k3YYn0zg8qWF8N2hJYiYWu7s3nBM_8dL',
  '1UGNwQ0VcRpy3SCCfTL9sJVTZBlCqqzLC',
  '1LtCOCuTgF9EIN-DSL_gHGPNWKMqQZJSb',
  '1Pt58xHqUaqfHv8-l0AX7VI8xlL9VLuBo',
  '19GGx7TMQ4PcJ3bYVj2zW86LaKDJtFkYc',
  '18vdZnrZ1eBTqCxLg1Zf15cV0ZuWSUDhS',
  '1-CZP_m7PvYjma-O4e4TDjKB-DjUPQqN0',
  '1nQkPbwY8LNclX_ID6_CAjI3Axy41G6wm',
  '1S97n8x0KoDQ9RLEoWl8naBgEl-qJr84o',
  '1g62zfiWn8EKEb7m0ODboRU3uGCIH8FlG',
  '1atzTM5fEGyKReYwlYivukyatDELztEad',
  '1aP2noh7kVRGg7fgPUVtSPzb47AOTv2N3',
  '1fodFiDQGn41PNOgklGMCVPwP4vuqR0Ci',
  '1Ns7IjKueL3l2LEiQza-gPGIPgF0me0kv',
  '1hsI7RqEWNEjH_dwbiMEXnUNiD5LitALv',
  '1ZciFn_5KMQxBaIFMFJ8Hd1zqKEhZaWLF',
  '1somd4ig0xHGvsEJo3Q1-8vduwjq3iywd'
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
  const results = [];
  for (let i = 0; i < driveIds.length; i += 5) {
    const batch = driveIds.slice(i, i + 5);
    const res = await Promise.all(batch.map(checkId));
    results.push(...res);
  }
  fs.writeFileSync('scratch/certs_drive_titles.json', JSON.stringify(results, null, 2));
  console.log('Inspected count:', results.length);
  results.slice(0, 15).forEach(r => console.log(`${r.id} -> ${r.title}`));
}

run();
