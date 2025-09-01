const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();
const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Bước 1: Redirect người dùng đến Google OAuth
router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
  });
  res.redirect(url);
});

// Bước 2: Xử lý callback sau khi người dùng đồng ý
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code");
  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return res.send("Không nhận được refresh_token. Vui lòng thử lại và đảm bảo thêm `prompt=consent` trong auth URL.");
    }
    console.log('\n==============================');
    console.log(' Lấy token thành công!');
    console.log(' Refresh Token:', tokens.refresh_token);
    console.log('==============================\n');
    res.send("Refresh token đã được lấy thành công! Kiểm tra terminal để copy và dán vào file .env.");
  } catch (error) {
    console.error(" Lỗi khi xử lý callback:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy token.");
  }
});

module.exports = router;