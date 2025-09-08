import {createClient} from '@supabase/supabase-js';

// biome-ignore lint/style/noNonNullAssertion: wip
const supabaseUrl = process.env.SUPABASE_URL!;
// biome-ignore lint/style/noNonNullAssertion: wip
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
