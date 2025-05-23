import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return res.status(401).json({ error: error?.message || 'No user session' });
  }

  res.status(200).json({ user: data.user });
}
