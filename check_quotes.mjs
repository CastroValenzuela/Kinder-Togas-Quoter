import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkQuotes() {
  const today = new Date('2026-05-23T00:00:00-07:00');
  const yesterday = new Date('2026-05-22T00:00:00-07:00');
  const tomorrow = new Date('2026-05-24T00:00:00-07:00');

  const { data, error } = await supabase
    .from('quotes')
    .select('id, institution_name, created_at, estimated_date')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    return;
  }

  console.log(`Encontradas ${data.length} cotizaciones creadas entre ayer y hoy:`);
  data.forEach(q => {
    console.log(`- ${q.institution_name} (Creada: ${q.created_at}) [Entrega: ${q.estimated_date}]`);
  });
}

checkQuotes();
