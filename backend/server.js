const express = require('express'); // framework để tạo server
const cors = require('cors'); // cho phép truy cập từ frontend khác domain
const session = require('cookie-session');
require('dotenv').config(); // tỉa biến môi trường từ file .env

const gmailRoutes = require('./routes/gmail');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(
session({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    })
);

// Gộp chung route
app.use('/api', gmailRoutes);

app.listen(8080, () => {
    console.log('Backend server running on http://localhost:8080');
}); 

// Đây là file entry point chính của backend
// Vai trò khởi chạy server và kết nối các middleware để phục vụ API gmail