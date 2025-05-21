export default async function handler(req, res) {
  const grokKey = process.env.GROK_API_KEY;

  const result = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${grokKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const data = await result.json();
  res.status(200).json(data);
}
