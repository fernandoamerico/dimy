require('dotenv').config();
const WebSocket = require('ws');
global.WebSocket = WebSocket;
globalThis.WebSocket = WebSocket;

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('media_catalog')
    .select('id, url, file_name, status, last_used_at, project_id')
    .order('last_used_at', { ascending: false })
    .limit(30);
  
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}
run();
