require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const express = require('express');
const jwt = require('jsonwebtoken');
const { pool, query: queryWithRetry } = require('../services/db'); // Sử dụng queryWithRetry
const router = express.Router();
const { addActivityLog } = require('../services/logService');

// -------------------------------------API Login-------------------------------------
router.post('/login', (req, res) => {
  const { user_email, password } = req.body;

  const query = 'SELECT * FROM users WHERE user_email = ?';
  queryWithRetry(query, [user_email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    const user = results[0];

    if (password !== user.password) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      role: user.role
    });
  });
});

// -------------------------------------API Dashboard-------------------------------------
router.get("/activity-logs", (req, res) => {
  queryWithRetry(`
    SELECT 
      al.log_id,
      al.action_type,
      al.description,
      al.performed_by,
      al.performed_at,
      b.guest_name,
      b.booking_status,
      b.booking_source,
      r.room_number,
      u.user_name
    FROM activity_logs al
    LEFT JOIN bookings b ON al.booking_id = b.booking_id
    LEFT JOIN rooms r ON b.room_id = r.room_id
    LEFT JOIN users u ON al.user_id = u.user_id
    ORDER BY al.performed_at DESC
    LIMIT 50
  `, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Cannot fetch activity logs" });
    }

    const mapActionType = {
      create_booking: 'Tạo đặt phòng',
      update_booking: 'Cập nhật đặt phòng',
      update_guest_info: 'Cập nhật thông tin khách',
      cancel_booking: 'Hủy đặt phòng'
    };

    rows.forEach(log => {
      log.action_type = mapActionType[log.action_type] || log.action_type;
    });

    res.json(rows);
  });
});

// -------------------------------------API Create Account-------------------------------------
router.post('/create-account', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'Admin') {
      return res.status(403).json({ message: 'Bạn không phải admin' });
    }

    const { user_name, user_email, password, role } = req.body;

    if (!user_name || !user_email || !password || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE user_email = ?';
    queryWithRetry(checkUserQuery, [user_email], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email đã được đăng ký' });
      }

      const insertUserQuery = 'INSERT INTO users (user_name, user_email, password, role) VALUES (?, ?, ?, ?)';
      queryWithRetry(insertUserQuery, [user_name, user_email, password, role], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Lỗi khi tạo tài khoản' });
        }
        res.status(201).json({ message: 'Tạo tài khoản thành công' });
      });
    });
  });
});

// -------------------------------------API Profile-------------------------------------
router.put('/profile', (req, res) => {
  const { user_email, password, newPassword } = req.body;

  const query = 'SELECT * FROM users WHERE user_email = ?';
  queryWithRetry(query, [user_email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi khi truy vấn cơ sở dữ liệu' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    const user = results[0];

    if (password !== user.password) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const updatePasswordQuery = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?';
    queryWithRetry(updatePasswordQuery, [newPassword, user_email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi khi cập nhật mật khẩu' });
      }
      res.status(201).json({ message: 'Mật khẩu đã được cập nhật thành công' });
    });
  });
});

// -------------------------------------API Room Management-------------------------------------
router.get('/rooms_bookings/current', (req, res) => {
  const query = `
    SELECT
      r.room_id,
      r.room_number,
      r.floor,
      r.price,
      CASE
        WHEN b.booking_status IN ('Checked-in', 'Confirmed') THEN 'Occupied'
        ELSE r.status
      END AS status,
      b.booking_id,
      b.guest_name,
      b.phone_number,
      b.booking_date,
      b.booking_source,
      b.booking_status,
      b.amount_received,
      b.check_in,
      b.check_out
    FROM rooms r
    LEFT JOIN bookings b
      ON b.booking_id = (
        SELECT bb.booking_id
        FROM bookings bb
        WHERE bb.room_id = r.room_id
          AND bb.booking_status IN ('Checked-in','Confirmed')
          AND DATE(bb.check_in) <= CURDATE()
          AND DATE(bb.check_out) >= CURDATE()
        ORDER BY bb.check_in ASC
        LIMIT 1
      )
    ORDER BY r.floor, r.room_number;
  `;

  queryWithRetry(query, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ message: 'Lỗi truy vấn CSDL.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Không có phòng trong hệ thống.' });
    }
    res.json(results);
  });
});

router.post('/bookings', (req, res) => {
  const {
    room_number,
    guest_name,
    phone_number,
    check_in,
    check_out,
    booking_source,
    booking_status,
    amount_received,
    booking_date
  } = req.body;

  if (!room_number || !guest_name || !check_in || !check_out) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
  }

  if (new Date(check_out) <= new Date(check_in)) {
    return res.status(400).json({ error: "Ngày check-out phải lớn hơn ngày check-in" });
  }

  const checkRoomQuery = 'SELECT room_id FROM rooms WHERE room_number = ?';
  queryWithRetry(checkRoomQuery, [room_number], (err, roomResults) => {
    if (err) return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    if (roomResults.length === 0) return res.status(404).json({ message: 'Phòng không tồn tại' });

    const room_id = roomResults[0].room_id;

    const checkOverlapQuery = `
      SELECT booking_id FROM bookings
      WHERE room_id = ?
        AND (
          (check_in <= ? AND check_out >= ?)
          OR
          (check_in <= ? AND check_out >= ?)
          OR
          (? <= check_in AND ? >= check_out)
        )
    `;
    queryWithRetry(
      checkOverlapQuery,
      [room_id, check_in, check_in, check_out, check_out, check_in, check_out],
      (err, overlapResults) => {
        if (err) return res.status(500).json({ message: 'Lỗi kiểm tra phòng trống' });

        if (overlapResults.length > 0) {
          return res.status(409).json({ message: 'Phòng không trống trong thời gian này' });
        }

        const insertBookingQuery = `
          INSERT INTO bookings (room_id, guest_name, phone_number, check_in, check_out, booking_source, booking_status, amount_received, booking_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        queryWithRetry(
          insertBookingQuery,
          [
            room_id,
            guest_name,
            phone_number,
            check_in,
            check_out,
            booking_source,
            booking_status || 'Confirmed',
            amount_received || 0,
            booking_date || new Date()
          ],
          (err, insertResult) => {
            if (err) {
              return res.status(500).json({ message: 'Lỗi khi thêm thông tin khách vào phòng' });
            }

            const newBooking = {
              booking_id: insertResult.insertId,
              room_id,
              room_number,
              guest_name,
              phone_number,
              check_in,
              check_out,
              booking_source,
              booking_status: booking_status || 'Confirmed',
              amount_received: amount_received || 0,
              booking_date: booking_date || new Date()
            };

            addActivityLog(
              insertResult.insertId, // Sửa bookingId thành insertResult.insertId
              req.user ? req.user.user_id : null,
              "create_booking",
              `Tạo đặt phòng cho khách ${guest_name} - Phòng ${room_number}`,
              "user",
              () => { }
            );

            res.status(201).json(newBooking);
          }
        );
      }
    );
  });
});

router.put('/bookings/:booking_id', (req, res) => {
  const { booking_id } = req.params;
  const { field, value } = req.body;

  const allowedFields = ['guest_name', 'phone_number', 'booking_source', 'booking_status', 'check_in', 'check_out', 'amount_received', 'booking_date'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ message: 'Trường không hợp lệ' });
  }

  const sql = `UPDATE bookings SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`;
  queryWithRetry(sql, [value, booking_id], (err, result) => {
    if (err) {
      console.error("Lỗi update booking BE:", err);
      return res.status(500).json({ message: 'Lỗi cập nhật CSDL' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking không tồn tại' });
    }
    res.json({ message: `Đã cập nhật ${field} thành công`, field, value });
  });
});

router.put("/:room_id/status", (req, res) => {
  const { room_id } = req.params;
  const { status } = req.body;

  queryWithRetry("SELECT status FROM rooms WHERE room_id = ?", [room_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Lỗi server" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phòng" });
    }

    if (rows[0].status === "Occupied") {
      return res.status(400).json({ error: "Không thể đổi trạng thái khi phòng đang được thuê" });
    }

    queryWithRetry("UPDATE rooms SET status = ? WHERE room_id = ?", [status, room_id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Lỗi server" });
      }

      res.json({ message: "Cập nhật trạng thái thành công", room_id, status });
    });
  });
});

// -------------------------------------API Booking-------------------------------------
router.get('/bookings/all', (req, res) => {
  const query = `
    SELECT 
      r.room_id,
      r.room_number,
      r.floor,
      r.price,
      b.booking_id,
      b.guest_name,
      b.phone_number,
      DATE_FORMAT(b.booking_date, '%Y-%m-%d %H:%i:%s') AS booking_date,
      b.booking_source,
      b.booking_status,
      b.amount_received,
      DATE_FORMAT(b.check_in, '%Y-%m-%d') AS check_in,
      DATE_FORMAT(b.check_out, '%Y-%m-%d') AS check_out,
      b.created_at,
      b.updated_at
    FROM rooms r
    LEFT JOIN bookings b 
      ON b.room_id = r.room_id
      AND b.booking_status IN ('Confirmed', 'Checked-in', 'Checked-out')
    ORDER BY r.floor, r.room_number, b.check_in ASC
  `;

  queryWithRetry(query, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ message: 'Lỗi truy vấn CSDL.' });
    }
    res.json(results);
  });
});

router.delete('/bookings/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  const checkBookingQuery = 'SELECT 1 FROM bookings WHERE booking_id = ?';
  queryWithRetry(checkBookingQuery, [booking_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Booking không tồn tại' });
    }

    const deleteBookingQuery = 'DELETE FROM bookings WHERE booking_id = ?';
    queryWithRetry(deleteBookingQuery, [booking_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi khi xóa booking' });
      }

      res.status(200).json({ message: 'Xóa booking thành công' });
    });
  });
});

// -------------------------------------API Analytics-------------------------------------
router.get('/rooms', (req, res) => {
  const query = `
    SELECT 
      room_id, 
      room_number, 
      room_type, 
      floor, 
      price, 
      status, 
      created_at, 
      updated_at
    FROM rooms
    ORDER BY floor, room_number;
  `;

  queryWithRetry(query, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;