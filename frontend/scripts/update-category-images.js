const { Client } = require('pg');
require('dotenv').config();

const categoryImages = {
  'cantalar': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
  'suet-modeller': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop',
  'sirt-cantasi': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
  'victorias-secret': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
  'clutch-el-cantasi': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop'
};

async function updateDb(name, connectionString) {
  console.log(`\nUpdating categories in ${name}...`);
  const client = new Client({ connectionString });
  try {
    await client.connect();

    for (const [slug, imageUrl] of Object.entries(categoryImages)) {
      const res = await client.query(
        'UPDATE "Category" SET image = $1 WHERE slug = $2 RETURNING id, name, slug, image;',
        [imageUrl, slug]
      );
      if (res.rows.length > 0) {
        console.log(`  ✓ Updated ${res.rows[0].name} (${res.rows[0].slug})`);
      } else {
        console.log(`  ✗ Category with slug "${slug}" not found.`);
      }
    }

    const checkRes = await client.query('SELECT id, name, slug, image FROM "Category" ORDER BY id;');
    console.log(`Current Category records in ${name}:`);
    console.table(checkRes.rows.map(r => ({ Name: r.name, Slug: r.slug, Image: r.image ? r.image.substring(0, 50) + '...' : null })));
  } catch (err) {
    console.error(`Error updating ${name}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await updateDb('LOCAL DB (lina_canta)', 'postgresql://postgres:postgres@localhost:5432/lina_canta');
  await updateDb('SUPABASE DB', process.env.DATABASE_URL);
}

main().catch(console.error);
