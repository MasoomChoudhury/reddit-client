// This is a serverless function that acts as an authenticated proxy to the Reddit API.

// A simple in-memory cache for the access token to avoid re-fetching on every request.
let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
  // If we have a valid, non-expired token in our cache, return it.
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Otherwise, fetch a new access token from Reddit using your credentials.
  // These credentials will be stored securely as environment variables in Vercel.
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'web:RedditMasoom:v1.0 (by /u/MasoomChoudhury)',
    },
    body: `grant_type=password&username=${username}&password=${password}`,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to get access token from Reddit:', errorBody);
    throw new Error('Failed to get access token from Reddit');
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Set the token expiry to 5 minutes before it actually expires, as a safety margin.
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
};

export default async function handler(req, res) {
  const { target } = req.query;

  if (!target) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  try {
    const token = await getAccessToken();
    const response = await fetch(decodeURIComponent(target), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'web:RedditMasoom:v1.0 (by /u/MasoomChoudhury)',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Failed to fetch from Reddit API:', errorBody);
      return res.status(response.status).json({ error: 'Failed to fetch from Reddit API' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
