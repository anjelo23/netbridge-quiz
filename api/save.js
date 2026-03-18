module.exports = async function handler(req, res) {
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
