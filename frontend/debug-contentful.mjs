import { createClient } from 'contentful';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env.local') });

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// 1. Show all entries in the compliance content type
const entries = await client.getEntries({ content_type: 'compliance', limit: 5 });

console.log(`\nFound ${entries.total} entries in "compliance" content type\n`);

entries.items.forEach((entry, i) => {
  console.log(`--- Entry ${i + 1} ---`);
  console.log('Field keys:', Object.keys(entry.fields));
  console.log('Fields:', JSON.stringify(entry.fields, null, 2));
  console.log();
});
