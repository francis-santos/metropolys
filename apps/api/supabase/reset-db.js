const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS ai_news CASCADE;
      DROP TABLE IF EXISTS trades CASCADE;
      DROP TABLE IF EXISTS auctions CASCADE;
      DROP TABLE IF EXISTS logs CASCADE;
      DROP TABLE IF EXISTS properties CASCADE;
      DROP TABLE IF EXISTS players CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
    `);

    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema.sql com as novas tipagens VARCHAR...');
    await client.query(sql);

    console.log('Migrations refeitas com sucesso!');
  } catch (error) {
    console.error('Erro na migration:', error);
  } finally {
    await client.end();
  }
}

run();
