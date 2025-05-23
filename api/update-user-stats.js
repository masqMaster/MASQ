import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { userId, totalWins, totalLosses, winStreak } = req.body;

  const { error } = await supabase
    .from('users')
    .update({
      total_wins: totalWins,
      total_losses: totalLosses,
      win_streak: winStreak
    })
    .eq('id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Stats updated' });
}
