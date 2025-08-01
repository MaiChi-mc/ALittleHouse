require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../services/db');  // Kết nối DB
const router = express.Router();

// API đăng nhập
router.post('/login', (req, res) => {
    const { user_email, password } = req.body;

    // Kiểm tra người dùng trong cơ sở dữ liệu
    const query = 'SELECT * FROM users WHERE user_email = ?';
    connection.query(query, [user_email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Người dùng không tồn tại' });
        }

        const user = results[0];

        // So sánh mật khẩu 
        if (password !== user.password) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // Tạo JWT token
        const token = jwt.sign({ userId: user.user_id, role: user.role }, jwtSecret, { expiresIn: '1h' });

        // Trả về token cho frontend
        res.status(200).json({ message: 'Đăng nhập thành công', token, user_email: user.user_email, role: user.role });
    });
});


// API tạo tài khoản người dùng (chỉ dành cho admin)
router.post('/create-account', (req, res) => {
    //   console.log("Request Body:", req.body);  // Kiểm tra dữ liệu nhận được từ frontend

    const token = req.headers['authorization']?.split(' ')[1];  // Lấy token từ header

    if (!token) {
        return res.status(401).json({ message: 'Không có quyền truy cập' });
    }

    jwt.verify(token, process.env.JWT_SECRET , (err, decoded) => {
        if (err || decoded.role !== 'Admin') {
            return res.status(403).json({ message: 'Bạn không phải admin' });
        }

        const { user_name, user_email, password, role } = req.body;

         // Kiểm tra xem các trường bắt buộc có hợp lệ không
        if (!user_name || !user_email || !password || !role) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Kiểm tra xem email đã tồn tại trong hệ thống chưa
        const checkUserQuery = 'SELECT * FROM users WHERE user_email = ?';
        connection.query(checkUserQuery, [user_email], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email đã được đăng ký' });
            }

            // Lưu người dùng mới vào cơ sở dữ liệu 
            const insertUserQuery = 'INSERT INTO users (user_name, user_email, password, role) VALUES (?, ?, ?, ?)';
            connection.query(insertUserQuery, [user_name, user_email, password, role], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi khi tạo tài khoản' });
                }
                res.status(201).json({ message: 'Tạo tài khoản thành công' });
            });
        });
    });
});

module.exports = router;