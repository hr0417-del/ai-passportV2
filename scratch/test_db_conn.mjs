import pg from 'pg';

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1'
];

async function testPoolers() {
  for (let reg of regions) {
    const cs = `postgresql://postgres.uxuaisvdmvkircymwvdl:Ekaakshar%402026@aws-0-${reg}.pooler.supabase.com:6543/postgres`;
    console.log(`Testing region ${reg}...`);
    const client = new pg.Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`✅ SUCCESS connected to ${reg}!`);
      await client.end();
      return cs;
    } catch(e) {
      console.log(`❌ Failed ${reg}:`, e.message);
    }
  }
}

testPoolers();
