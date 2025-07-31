// backend/services/db.js
const mysql = require('mysql2');

// Tạo kết nối tới MySQL
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',  // Tên người dùng MySQL
    password: 'Chi@261189',  // Mật khẩu MySQL
    database: 'hotel_management'  // Tên cơ sở dữ liệu bạn đã tạo
});

// Kiểm tra kết nối
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', err.stack);
        return;
    }
    console.log('Đã kết nối đến cơ sở dữ liệu với ID: ' + connection.threadId);
});

module.exports = connection;
