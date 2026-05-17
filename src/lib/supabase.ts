import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qqfqwvxmhiacoyqwobjd.supabase.co';
const supabaseKey = 'sb_publishable_koOhz9hug0yv6t46X5HUxQ_Ynt8Bv0X';

export const supabase = createClient(supabaseUrl, supabaseKey);
