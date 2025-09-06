const mysql = require('mysql2');
const url = require('url');
require('dotenv').config();

// Parse DATABASE_URL từ biến môi trường
const dbUrl = process.env.DATABASE_URL || "mysql://root:Chi%40261189@127.0.0.1:3306/hotel_management";
const parsedUrl = url.parse(dbUrl);

// Lấy user và password từ auth part
const [user, password] = parsedUrl.auth.split(':');

// Tạo pool từ thông tin Railway
const pool = mysql.createPool({
  host: parsedUrl.hostname,
  port: parsedUrl.port,
  user,
  password,
  database: parsedUrl.pathname.replace('/', ''), // bỏ dấu "/"
  timezone: '+07:00',
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000
});

// Wrapper cho pool.query
function queryWithRetry(sql, params, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = [];
  }

  const runQuery = (retries = 1) => {
    pool.query(sql, params, (err, results, fields) => {
      if (
        err &&
        retries > 0 &&
        ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT'].includes(err.code)
      ) {
        console.warn(`MySQL connection lost (${err.code}), retrying...`);
        return runQuery(retries - 1);
      }
      if (cb) return cb(err, results, fields);
    });
  };

  runQuery();
}

// Lấy connection thủ công
function getConnection(cb) {
  pool.getConnection(cb);
}

module.exports = {
  pool,
  query: queryWithRetry,
  getConnection
};

