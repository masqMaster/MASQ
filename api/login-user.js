import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  const user = data.user;
  if (!user) return res.status(401).json({ error: 'No user returned' });

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single();

  const username = profile?.username || null;
  res.status(200).json({ user, username });
}
