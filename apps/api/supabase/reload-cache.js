const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    console.log('Sending NOTIFY pgrst, \'reload schema\'...');
    await client.query('NOTIFY pgrst, \'reload schema\'');
    console.log('Schema cache reloaded!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
