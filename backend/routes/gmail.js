// backend/routes/gmail.js
const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();

function getOAuth2() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  // Luôn dùng refresh_token từ ENV (không phụ thuộc cookie)
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return oauth2Client;
}

router.get('/gmail/ping', (_req, res) => res.json({ ok: true }));

router.get('/gmail/threads', async (req, res) => {
  try {
    const auth = getOAuth2();
    const gmail = google.gmail({ version: 'v1', auth });

    const list = await gmail.users.threads.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: 50,
      q: '', // ví dụ: 'newer_than:30d'
    });

    const threads = await Promise.all(
      (list.data.threads || []).map(async (t) => {
        const full = await gmail.users.threads.get({ userId: 'me', id: t.id });
        const messages = (full.data.messages || []).map((m) => {
          const headers = Object.fromEntries(
            (m.payload.headers || []).map((h) => [h.name.toLowerCase(), h.value])
          );
          const getBody = () => {
            const parts = m.payload.parts || [];
            const html = parts.find((p) => p.mimeType === 'text/html');
            const text = parts.find((p) => p.mimeType === 'text/plain');
            const data = html?.body?.data || text?.body?.data || m.payload?.body?.data || '';
            return Buffer.from(data, 'base64').toString('utf8');
          };
          return {
            messageId: headers['message-id'] || m.id,
            subject: headers.subject || '',
            from: headers.from || '',
            replyTo: headers['reply-to'] || headers.from || '',
            date: headers.date || '',
            snippet: m.snippet || '',
            body: getBody(),
          };
        });
        return { id: t.id, messages };
      })
    );

    res.json({ threads });
  } catch (e) {
    console.error('gmail/threads error:', e?.response?.data || e);
    res.status(500).json({ error: 'GMAIL_THREADS_FAILED' });
  }
});

router.post('/gmail/send', express.json(), async (req, res) => {
  try {
    const { to, subject, body, threadId, inReplyTo } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ error: 'MISSING_FIELDS' });

    const auth = getOAuth2();
    const gmail = google.gmail({ version: 'v1', auth });

    const from = 'alittlehouse85@gmail.com'; // email của khách sạn
    const headers = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
    ];
    if (inReplyTo) {
      headers.push(`In-Reply-To: ${inReplyTo}`);
      headers.push(`References: ${inReplyTo}`);
    }
    const raw = `${headers.join('\r\n')}\r\n\r\n${body}`;
    const encoded = Buffer.from(raw)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encoded, threadId },
    });

    res.json({ ok: true, id: result.data.id });
  } catch (e) {
    console.error('gmail/send error:', e?.response?.data || e);
    res.status(500).json({ error: 'GMAIL_SEND_FAILED' });
  }
});

module.exports = router;
