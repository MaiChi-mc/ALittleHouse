const express = require('express'); // framework để tạo server
const cors = require('cors'); // cho phép truy cập từ frontend khác domain
const bodyParser = require('body-parser');
const session = require('cookie-session');
require('dotenv').config(); // tải biến môi trường từ file .env

// Import các route
const gmailRoutes = require('./routes/gmail');
const oauthRoutes = require('./routes/oauth');
const authRouter = require('./routes/auth'); 
const cronJobsRouter = require('./routes/cronJobs'); // Import cron jobs

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Cấu hình session
app.use(
session({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    })
);

// Kết nối route
app.use('/api/auth', authRouter);
app.use('/api', gmailRoutes);
app.use('/api', oauthRoutes);
app.use('/api/cron-jobs', cronJobsRouter); // Kết nối cron jobs

// Cấu hình cổng và chạy server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});


// Đây là file entry point chính của backend
// Vai trò khởi chạy server và kết nối các middleware để phục vụ API gmail