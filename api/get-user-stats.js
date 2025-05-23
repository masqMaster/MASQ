import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { userId } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('total_wins, total_losses, win_streak')
    .eq('id', userId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
}
