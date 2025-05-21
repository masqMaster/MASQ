// supabaseClient.js
// import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// // Replace these with your actual values from Supabase dashboard
// const SUPABASE_URL = "https://pklmlttcycefshwxqcwu.supabase.co";
// const SUPABASE_ANON_KEY = "";

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// let supabase = null;

// export async function getSupabaseClient() {
//   if (supabase) return supabase;

//   const res = await fetch('/api/get-supabase-key');
//   const { url, key } = await res.json();

//   const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
//   supabase = createClient(url, key);

//   return supabase;
// }

// let cachedClient = null;

// export async function getSupabaseClient() {
//   if (cachedClient) return cachedClient;

//   const res = await fetch('/api/get-supabase-key');
//   const { url, key } = await res.json();

//   const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
//   cachedClient = createClient(url, key);

//   return cachedClient;
// }

// // Optional: allow external modules to "wait for it"
// export const supabase = getSupabaseClient();

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let cachedClient = null;

function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are missing');
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceKey);
  return cachedClient;
}

export const supabase = getSupabaseClient(); // exported for optional internal use

export default async function handler(req, res) {
  const supabase = getSupabaseClient();

  const { userId } = req.body;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error });
  res.status(200).json(data);
}
