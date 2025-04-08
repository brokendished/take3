import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { name, email, issue, image, aiResponse = '' } = req.body;

  const summaryMessage = `
    New AI Quote Request:

    Name: ${name}
    Email: ${email}
    Issue: ${issue}
    Photo uploaded: ${image ? 'Yes' : 'No'}
    AI Response: ${aiResponse}
  `;

  try {
    // Send email to yourself
    await resend.emails.send({
      from: 'AI Bot <no-reply@yourdomain.com>',
      to: 'you@example.com', // ← change this to your email
      subject: '🧠 New AI Quote Request',
      html: `
        <h2>New AI Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Issue:</strong> ${issue}</p>
        <p><strong>Uploaded Photo:</strong> ${image ? 'Yes' : 'No'}</p>
        <p><strong>AI Suggestion:</strong></p>
        <blockquote>${aiResponse}</blockquote>
      `
    });

    // Log to Google Sheet (optional)
    if (process.env.SHEET_WEBHOOK_URL) {
      await fetch(process.env.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          issue,
          image,
          aiResponse
        })
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('💥 API Error:', error.message || error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
