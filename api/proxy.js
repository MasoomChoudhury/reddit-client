export default async function handler(req, res) {
  const { target } = req.query;

  if (!target) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  try {
    const response = await fetch(decodeURIComponent(target), {
      headers: {
        'User-Agent': 'web:RedditMasoom:v1.0 (by /u/MasoomChoudhury)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from Reddit' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
