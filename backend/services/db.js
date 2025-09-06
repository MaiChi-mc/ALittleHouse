const mysql = require('mysql2');
const url = require('url');
require('dotenv').config();

let pool;

if (process.env.MYSQLHOST) {
  // Kết nối bằng biến môi trường Railway/Render
  pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    timezone: '+07:00',
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
  });
} else {
  // Fallback khi chạy local (DATABASE_URL hoặc config tay)
  const dbUrl =
    process.env.DATABASE_URL ||
    'mysql://root:Chi%40261189@127.0.0.1:3306/hotel_management';
  const parsedUrl = url.parse(dbUrl);
  const [user, password] = parsedUrl.auth.split(':');

  pool = mysql.createPool({
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    user,
    password,
    database: parsedUrl.pathname.replace('/', ''),
    timezone: '+07:00',
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
  });
}

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
  getConnection,
};
