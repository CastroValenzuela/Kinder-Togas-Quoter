import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Inserting Venta Preescolar prices...");
  const { data, error } = await supabase
    .from('pricing')
    .upsert([
      { key: 'V_E1_PREESCOLAR', price: 180, discount_percent: 0 },
      { key: 'V_E2_PREESCOLAR', price: 190, discount_percent: 0 },
      { key: 'V_E3_PREESCOLAR', price: 200, discount_percent: 0 }
    ], { onConflict: 'key' });

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Success!");
  }
}

run();
