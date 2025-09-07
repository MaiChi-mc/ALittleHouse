const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
require('dotenv').config();

// Cấu hình OAuth2 client (dùng refresh_token luôn)
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

auth.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth });

// API: Lấy danh sách email từ Gmail
router.get('/email/threads', async (req, res) => {
  try {
    const list = await gmail.users.threads.list({ userId: 'me', maxResults: 50 });
    const threads = list.data.threads || [];

    const result = await Promise.all(
      threads.map(async (thread) => {
        const detail = await gmail.users.threads.get({ userId: 'me', id: thread.id });

        const messages = detail.data.messages.map((msg) => {
          const headers = msg.payload.headers;
          const from = headers.find(h => h.name === 'From')?.value || '';
          const subject = headers.find(h => h.name === 'Subject')?.value || '';
          const date = headers.find(h => h.name === 'Date')?.value || '';
          const replyTo = headers.find(h => h.name === 'Reply-To')?.value || from;
          const messageId = headers.find(h => h.name === 'Message-ID')?.value || '';

          function getBody(payload) {
            if (payload.body?.data) {
              return Buffer.from(payload.body.data, 'base64').toString('utf-8');
            } else if (payload.parts?.length) {
              return payload.parts
                .map(part => getBody(part))
                .join('');
            }
            return '';
          }

          const body = getBody(msg.payload);

          return { from, replyTo, subject, date, body, messageId };
        });

        return {
          id: thread.id,
          messages
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(" Error fetching email threads:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Gmail threads" });
  }
});


// API: Gửi email
router.post('/email/send', async (req, res) => {
  console.log(' req.body:', req.body);
  const { to, subject, body, threadId, inReplyTo } = req.body;

  if (!to || !to.includes('@')) {
    console.error(" Invalid recipient:", to);
    return res.status(400).send("Recipient email address is required");
  }

  // console.log(" Email will be sent to:", to);

  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;

  const headers = [
  `From: me`,
  `To: ${to}`,
  `Subject: ${encodedSubject}`,
  `Content-Type: text/plain; charset="UTF-8"`,
];

  if (inReplyTo) {
    headers.push(`In-Reply-To: ${inReplyTo}`);
    headers.push(`References: ${inReplyTo}`);
  }

  const message = [...headers, '', body].join('\n');
  // console.log(" Raw MIME message:\n", message);

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || undefined,
      },
    });

    res.json({ success: true });
  } catch (err) {
    // console.error(" Gmail send error:", err.response?.data || err.message);
    res.status(500).send("Failed to send email via Gmail API");
  }
});

module.exports = router;
