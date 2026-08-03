import pg from 'pg';
import fs from 'fs';

const dbUrl = 'postgresql://postgres.uxuaisvdmvkircymwvdl:Ekaakshar%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function applyStage9Migration() {
  console.log('=== APPLYING STAGE 9 MIGRATION TO SUPABASE ===');
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const schemaSql = fs.readFileSync('c:/Users/HP/Downloads/AIPASS/supabase/schema.sql', 'utf8');
    const stage9SqlIndex = schemaSql.indexOf('-- 12. STAGE 9');
    
    if (stage9SqlIndex === -1) {
      throw new Error('Could not find Section 12 in schema.sql');
    }

    const stage9Sql = schemaSql.substring(stage9SqlIndex);
    console.log('Executing Stage 9 SQL length:', stage9Sql.length);

    await client.query(stage9Sql);
    console.log('✅ Stage 9 Migration SQL executed successfully!');

    // PHASE B: Bootstrap ADMIN
    console.log('=== PHASE B: BOOTSTRAPPING FIRST ADMIN ===');
    const adminUuid = '913a05f6-56df-4b0f-b789-f0ee9b929611';
    const bootstrapRes = await client.query(`
      UPDATE public.profiles
      SET role = 'ADMIN'
      WHERE id = $1 AND role = 'LEARNER'
      RETURNING id, full_name, email, role;
    `, [adminUuid]);

    console.log('Admin Bootstrap result:', bootstrapRes.rows);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

applyStage9Migration();
