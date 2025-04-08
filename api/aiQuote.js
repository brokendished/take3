import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { name, email, phone, image, messages = [] } = req.body;

  const contact = email || phone;
  if (!name || !contact || messages.length === 0) {
    return res.status(400).json({ error: 'Missing name, contact info, or messages' });
  }

  let aiResponse = 'Sorry, I couldn’t generate a helpful response.';

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful, friendly AI chatbot that assists homeowners with diagnosing issues and providing repair suggestions and rough quotes based on their descriptions. Keep answers brief, clear, and useful. Respond like a human.'
          },
          ...messages.map((msg) => ({
            role: msg.from === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    aiResponse = data.choices?.[0]?.message?.content || aiResponse;
  } catch (err) {
    console.error('OpenAI error:', err.message || err);
  }

  try {
    await resend.emails.send({
      from: 'AI Quote Bot <no-reply@yourdomain.com>',
      to: 'you@example.com', // ← Your real email here
      subject: 'New AI Chat Submission',
      html: `
        <h2>New Chat Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Uploaded Photo:</strong> ${image ? 'Yes' : 'No'}</p>
        <h3>Conversation:</h3>
        ${messages.map(m => `<p><strong>${m.from}:</strong> ${m.text}</p>`).join('')}
        <h3>AI Response:</h3>
        <p>${aiResponse}</p>
      `
    });

    res.status(200).json({ success: true, reply: aiResponse });
  } catch (err) {
    console.error('Email/send error:', err.message || err);
    res.status(500).json({ error: 'Something went wrong sending the email or logging.' });
  }
}
