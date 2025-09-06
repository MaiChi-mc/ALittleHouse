const express = require('express'); // framework để tạo server
const cors = require('cors'); // cho phép truy cập từ frontend khác domain
const bodyParser = require('body-parser');
const session = require('cookie-session');
require('dotenv').config(); // tải biến môi trường từ file .env
const db = require('./services/db'); // kết nối DB

// Import các route
const gmailRoutes = require('./routes/gmail');
const oauthRoutes = require('./routes/oauth');
const authRouter = require('./routes/auth'); 
const cronJobsRouter = require('./routes/cronJobs'); // Import cron jobs

const app = express();

// Middleware
const allowedOrigins = [ 
  'http://localhost:5173',
  process.env.FRONTEND_URL // URL FE trên Render  
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
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