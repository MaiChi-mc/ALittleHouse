const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Cấu hình OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Dùng refresh_token cố định
auth.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Step 1: Redirect user đến trang đăng nhập Google
router.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.redirect(url); // chuyển hướng đến trang GG
});

// Step 2: Nhận code và đổi sang access_token
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query; // lấy code mà gg trả về
  const { tokens } = await oauth2Client.getToken(code); // đổi code sang access_token

  console.log(" Refresh Token:", tokens.refresh_token);
  
  req.session.tokens = tokens; // lưu token vào session để các route khác có thể dùng

  res.redirect('http://localhost:5173/messages'); // quay lại frontend
});

// API: Lấy danh sách email từ Gmail
router.get('/email/threads', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Not authenticated' });

  // khởi tạo gmail API client
  const auth = new google.auth.OAuth2(); 
  auth.setCredentials(req.session.tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  // gọi API lấy 15 cuộc hội thoại gần nhất
  const list = await gmail.users.threads.list({ userId: 'me', maxResults: 15 });
  const threads = list.data.threads || [];

  // với mỗi thread, gọi tiếp API lấy danh sách message
  const result = await Promise.all(threads.map(async (thread) => {
    const detail = await gmail.users.threads.get({ userId: 'me', id: thread.id });
    const messages = detail.data.messages.map((msg) => {
      const headers = msg.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const replyTo = headers.find(h => h.name === 'Reply-To')?.value || from;
      const messageId = headers.find(h => h.name === 'Message-ID')?.value || '';
      const snippet = msg.snippet;

      return { from, replyTo, subject, date, snippet, messageId };
    });

    return { // trả về frontend
      id: thread.id,
      messages
    };
  }));

  res.json(result);
});
 
// API: Gửi email từ tài khoản Gmail
router.post('/email/send', async (req, res) => {
  console.log('📥 req.body:', req.body); 
  const { to, subject, body, threadId, inReplyTo } = req.body; // lấy dữ liệu email từ body

    // kiểm tra email có hợp lệ hay không
    if (!to || !to.includes('@')) {
    console.error(" Invalid or missing recipient address:", to);
    return res.status(400).send("Recipient email address is required");
    }

     // in ra để chắc chắn to là email hợp lệ
    console.log("Email will be sent to:", to);

  if (!req.session.tokens) 
    return res.status(401).json({ error: 'Not authenticated' });

  const auth = new google.auth.OAuth2();
  auth.setCredentials(req.session.tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  // định dang email chuẩn: header + content
  const headers = [
  `From: me`,
  `To: ${to}`,
  `Subject: ${subject}`,
  `Content-Type: text/plain; charset="UTF-8"`,
];

if (inReplyTo) {
  headers.push(`In-Reply-To: ${inReplyTo}`);
  headers.push(`References: ${inReplyTo}`);
}

const message = [...headers, '', body].join('\n');

   console.log("MIME raw message:\n", message); // in ra message để kiểm tra

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

  console.log(" Email sent successfully!");
  res.json({ success: true });
} catch (err) {
  console.error(" Gmail send error:", err.response?.data || err.message);
  res.status(500).send("Failed to send email via Gmail API");
}
});

module.exports = router;  


// Mục tiêu:
// Đăng nhập google account, sau đó lấy token để quay lại frontend. 
// Trong đó có khởi tạo API client để có thể lấy email và danh sách những email trong thread đó. 
// Cho phép gửi email với định dạng gồm header + content