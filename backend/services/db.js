const mysql = require('mysql2');

// Tạo pool
const pool = mysql.createPool({
  host: '127.0.0.1', // hoặc 'localhost'127.0.0.1
  user: 'root',
  password: 'Chi@261189',
  database: 'hotel_management',
  timezone: '+07:00', // Giữ đúng giờ VN
  dateStrings: true,   // Trả về chuỗi thay vì Date object
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000
});

// Wrapper cho pool.query (hỗ trợ cả callback và Promise)
function queryWithRetry(sql, params, cb) {
  // Nếu params là function => không có params
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
        return runQuery(retries - 1); // thử lại
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

// Export giữ nguyên tên
module.exports = {
  pool,
  query: queryWithRetry,
  getConnection
};
