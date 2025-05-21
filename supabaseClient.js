// supabaseClient.js
// import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// // Replace these with your actual values from Supabase dashboard
// const SUPABASE_URL = "https://pklmlttcycefshwxqcwu.supabase.co";
// const SUPABASE_ANON_KEY = "";

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


let supabase = null;

export async function getSupabaseClient() {
  if (supabase) return supabase;

  const res = await fetch('/api/get-supabase-key');
  const { url, key } = await res.json();

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  supabase = createClient(url, key);

  return supabase;
  export const supabase;
}
