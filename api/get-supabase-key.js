export default function handler(req, res) {
  const key = process.env.SUPABASE_ANON_KEY;
  const url = process.env.SUPABASE_URL;
  res.status(200).json({ url, key });
}
