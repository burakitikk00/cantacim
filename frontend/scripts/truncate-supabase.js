const { Client } = require('pg');
require('dotenv').config();

async function truncateSupabase() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to Supabase. Fetching tables to truncate...');

    const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename != '_prisma_migrations';
    `);

    const tables = res.rows.map(r => `"${r.tablename}"`);
    if (tables.length === 0) {
      console.log('No tables found.');
      return;
    }

    console.log(`Truncating ${tables.length} tables with CASCADE...`);
    await client.query(`TRUNCATE TABLE ${tables.join(', ')} CASCADE;`);
    console.log('All Supabase application tables have been successfully truncated (emptied)!');
  } catch (err) {
    console.error('Error truncating tables in Supabase:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

truncateSupabase();
