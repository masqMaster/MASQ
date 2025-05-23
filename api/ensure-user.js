import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { userId, email } = req.body;

  const { data: user, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (selectError) return res.status(400).json({ error: selectError.message });
  if (user) return res.status(200).json({ message: 'User already exists' });

  const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

  const { error: insertError } = await supabase
    .from('users')
    .insert({ id: userId, username, total_wins: 0, total_losses: 0, win_streak: 0 });

  if (insertError) return res.status(400).json({ error: insertError.message });
  res.status(200).json({ message: 'User created', username });
}
