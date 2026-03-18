// Vercel serverless function — /api/save
// The Google Apps Script URL lives ONLY in Vercel environment variables.
// It never appears in the frontend HTML or your GitHub repo.
//
// Setup:
//   1. In Vercel dashboard → your project → Settings → Environment Variables
//   2. Add:  SHEET_URL   = <your Apps Script web app URL>
//   3.       QUIZ_TOKEN  = <any long random string you choose, e.g. "nbq-2025-xK9mP">
//   4. Add the same QUIZ_TOKEN value to the HTML file where indicated.

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check the shared token so random people can't POST fake results
  const { token, ...data } = req.body;
  if (!token || token !== process.env.QUIZ_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Basic validation — reject obviously bad payloads
  if (!data.name || !data.studentId || typeof data.score !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Forward to Google Sheets
  try {
    await fetch(process.env.SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Don't expose the Apps Script URL in error messages
    return res.status(500).json({ error: 'Save failed' });
  }
}
