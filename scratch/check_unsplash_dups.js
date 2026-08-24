require('dotenv').config();
const WebSocket = require('ws');
global.WebSocket = WebSocket;
globalThis.WebSocket = WebSocket;

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Extracts the core photo path/identifier from an Unsplash URL.
// E.g., https://images.unsplash.com/photo-1504307651254-35680f356dfd?crop=...
// returns "photo-1504307651254-35680f356dfd"
function getUnsplashId(url) {
  if (!url) return null;
  const match = url.match(/photo-[a-zA-Z0-9-]+/);
  return match ? match[0] : null;
}

async function run() {
  const { data, error } = await supabase
    .from('media_catalog')
    .select('id, url, file_name, status, last_used_at, created_at');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Total images in catalog: ${data.length}`);
  
  const idMap = new Map();
  for (const item of data) {
    const unsplashId = getUnsplashId(item.url);
    if (unsplashId) {
      if (!idMap.has(unsplashId)) {
        idMap.set(unsplashId, []);
      }
      idMap.get(unsplashId).push(item);
    }
  }

  console.log("\nUnsplash images with duplicate IDs in DB:");
  let dupCount = 0;
  for (const [unsplashId, items] of idMap.entries()) {
    if (items.length > 1) {
      dupCount++;
      console.log(`\nID: ${unsplashId} (found ${items.length} times)`);
      items.forEach(item => {
        console.log(`  - DB ID: ${item.id}`);
        console.log(`    URL: ${item.url}`);
        console.log(`    Status: ${item.status}`);
        console.log(`    Last Used At: ${item.last_used_at}`);
        console.log(`    Created At: ${item.created_at}`);
      });
    }
  }
  console.log(`\nTotal duplicate Unsplash images found: ${dupCount}`);
}

run();
