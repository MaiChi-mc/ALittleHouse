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

    // Thêm user_name vào payload
    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
        user_name: user.user_name,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

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

// API quên mật khẩu
router.post('/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;

  // Kiểm tra người dùng
  const query = 'SELECT * FROM users WHERE user_email = ?';
  queryWithRetry(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi khi truy vấn cơ sở dữ liệu' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    // Cập nhật mật khẩu mới
    const updatePasswordQuery = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?';
    queryWithRetry(updatePasswordQuery, [newPassword, email], (err2) => {
      if (err2) {
        return res.status(500).json({ message: 'Lỗi khi cập nhật mật khẩu' });
      }
      res.json({ message: 'Đặt lại mật khẩu thành công!' });
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
      al.performed_at,
      b.guest_name,
      b.booking_status,
      b.booking_source,
      r.room_number
    FROM activity_logs al
    LEFT JOIN bookings b ON al.booking_id = b.booking_id
    LEFT JOIN rooms r ON b.room_id = r.room_id
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
      cancel_booking: 'Hủy đặt phòng',
      update_room_status: 'Cập nhật trạng thái phòng'
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

//API thêm booking
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

  if (new Date(check_out) < new Date(check_in)) {
    return res.status(400).json({ error: "Ngày check-out phải lớn hơn ngày check-in" });
  }

  if (new Date(check_in) < new Date(booking_date) || new Date(check_out) < new Date(booking_date)) {
    return res.status(400).json({ error: "Ngày check-in và check-out phải lớn hơn ngày đặt" });
  }

  const checkRoomQuery = 'SELECT room_id FROM rooms WHERE room_number = ?';
  queryWithRetry(checkRoomQuery, [room_number], (err, roomResults) => {
    if (err) return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    if (roomResults.length === 0) return res.status(404).json({ message: 'Phòng không tồn tại' });

    const room_id = roomResults[0].room_id;

    const checkOverlapQuery = `
      SELECT booking_id FROM bookings
      WHERE room_id = ? 
        AND booking_status <> 'Cancelled'
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
              insertResult.insertId,
              "create_booking",
              `Tạo mới đơn đặt phòng cho khách ${guest_name} - Phòng ${room_number}`
            );

            res.status(201).json(newBooking);
          }
        );
      }
    );
  });
});

// API sửa booking
router.put('/bookings/:booking_id', (req, res) => {
  const { booking_id } = req.params;
  const updates = req.body;

  const allowedFields = [
    'guest_name', 'phone_number', 'booking_source',
    'booking_status', 'check_in', 'check_out',
    'amount_received', 'booking_date'
  ];

  const fields = Object.keys(updates).filter(f => allowedFields.includes(f));
  if (fields.length === 0) {
    return res.status(400).json({ message: 'Không có trường hợp lệ để update' });
  }

  // Nếu có check_in hoặc check_out -> kiểm tra ngày
  const hasDateUpdate = fields.includes('check_in') || fields.includes('check_out');

  // Lấy booking hiện tại để biết room_id và check_in/check_out gốc
  const getBookingQuery = `SELECT * FROM bookings WHERE booking_id = ?`;
  queryWithRetry(getBookingQuery, [booking_id], (err, bookingResult) => {
    if (err) return res.status(500).json({ message: 'Lỗi khi lấy thông tin booking' });
    if (bookingResult.length === 0) return res.status(404).json({ message: 'Booking không tồn tại' });

    const booking = bookingResult[0];
    const room_id = booking.room_id;

    // Nếu không update ngày, bỏ qua kiểm tra overlap
    if (!hasDateUpdate) {
      return applyUpdate();
    }

    const newCheckIn = updates.check_in || booking.check_in;
    const newCheckOut = updates.check_out || booking.check_out;

    // Kiểm tra hợp lệ của ngày
    if (new Date(newCheckOut) < new Date(newCheckIn)) {
      return res.status(400).json({ error: "Ngày check-out phải lớn hơn ngày check-in" });
    }
    if (new Date(newCheckIn) < new Date(booking.booking_date) || new Date(newCheckOut) < new Date(booking.booking_date)) {
      return res.status(400).json({ error: "Ngày check-in và check-out phải lớn hơn ngày đặt" });
    }

    // Kiểm tra overlap với các booking khác
    const overlapQuery = `
      SELECT booking_id FROM bookings
      WHERE room_id = ?
        AND booking_id <> ?
        AND (
          (check_in <= ? AND check_out >= ?)
          OR (check_in <= ? AND check_out >= ?)
          OR (? <= check_in AND ? >= check_out)
        )
    `;
    queryWithRetry(
      overlapQuery,
      [room_id, booking_id, newCheckIn, newCheckIn, newCheckOut, newCheckOut, newCheckIn, newCheckOut],
      (err, overlapResults) => {
        if (err) return res.status(500).json({ message: 'Lỗi kiểm tra phòng trống' });
        if (overlapResults.length > 0) {
          return res.status(409).json({ message: 'Phòng không trống trong thời gian này' });
        }
        applyUpdate();
      }
    );

    // Hàm thực hiện UPDATE
    function applyUpdate() {
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => updates[f]);

      const sql = `UPDATE bookings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`;
      queryWithRetry(sql, [...values, booking_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật CSDL' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking không tồn tại' });

        pool.query(
          `SELECT r.room_number, b.guest_name
          FROM bookings b
          JOIN rooms r ON b.room_id = r.room_id
          WHERE b.booking_id = ?`,
          [booking_id],
          (err, rows) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Lỗi truy vấn room_number");
            }
            const room_number = rows[0]?.room_number || '';
            const guest_name = rows[0]?.guest_name || '';

            addActivityLog(
              booking_id,
              "update_booking",
              `Cập nhật thông tin khách ${guest_name} - Phòng ${room_number}`
            );
          }
        );

        res.json({ message: 'Cập nhật thành công', fields });
      });
    }
  });
});


// API đổi room_status
router.put('/:room_id/status', (req, res) => {
  const { room_id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Thiếu status" });

  queryWithRetry("SELECT room_number, status FROM rooms WHERE room_id = ?", [room_id], (err, rows) => {
    if (err) {
      console.error("Lỗi SELECT room:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy phòng" });

    const { room_number, status: currentStatus } = rows[0];

    queryWithRetry("UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?", [status, room_id], (err, result) => {
      if (err) {
        console.error("Lỗi UPDATE room:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }

      addActivityLog(
        null,
        "update_room_status",
        `Thay đổi trạng thái phòng ${room_number} thành ${status}`
      );

      res.json({ message: "Cập nhật trạng thái thành công", room_id, status });
    });
  });
});

// -------------------------------------API Booking-------------------------------------
// API lấy tất cả booking không bao gồm Cancelled (dành cho trang Booking)
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

// API xóa booking
router.delete('/bookings/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  const selectSql = `
    SELECT b.guest_name, r.room_number, r.room_id
    FROM bookings b
    JOIN rooms r ON b.room_id = r.room_id
    WHERE b.booking_id = ?
  `;
  queryWithRetry(selectSql, [booking_id], (err, rows) => {
    if (err) {
      console.error("Lỗi SELECT booking:", err);
      return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking không tồn tại' });
    }

    const { guest_name, room_number, room_id } = rows[0];

    // Thay vì xóa, cập nhật trạng thái thành Cancelled
    const updateBookingSql = `
      UPDATE bookings
      SET booking_status = 'Cancelled'
      WHERE booking_id = ?
    `;
    queryWithRetry(updateBookingSql, [booking_id], (err) => {
      if (err) {
        console.error("Lỗi khi cập nhật trạng thái booking:", err);
        return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái booking' });
      }

      // Cập nhật trạng thái phòng thành Available
      const updateRoomSql = `
        UPDATE rooms
        SET status = 'Available'
        WHERE room_id = ?
      `;
      queryWithRetry(updateRoomSql, [room_id], (err) => {
        if (err) {
          console.error("Lỗi khi cập nhật trạng thái phòng:", err);
          return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái phòng' });
        }

        // Ghi lại lịch sử hoạt động
        addActivityLog(
          booking_id,
          "cancel_booking",
          `Hủy đơn đặt phòng của ${guest_name} - Phòng ${room_number}`
        );

        res.status(200).json({ message: 'Đã hủy booking và cập nhật phòng thành công' });
      });
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

// API lấy tất cả booking có cả Cancelled (dành cho trang Analytics)
router.get('/bookings/all_with_cancelled', (req, res) => {
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
      AND b.booking_status IN ('Confirmed', 'Checked-in', 'Checked-out', 'Cancelled')
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

router.get("/search", (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm" });

  const searchKey = `%${keyword}%`;

  const sql = `
    SELECT b.*, r.room_number
    FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.room_id
    WHERE LOWER(b.guest_name) LIKE LOWER(?) 
      OR LOWER(b.phone_number) LIKE LOWER(?)
      OR LOWER(r.room_number) LIKE LOWER(?) 
      OR DATE_FORMAT(b.check_in, '%Y-%m-%d') LIKE ?
      OR DATE_FORMAT(b.check_out, '%Y-%m-%d') LIKE ?
      OR LOWER(b.booking_source) LIKE LOWER(?)
    ORDER BY b.booking_date DESC
    LIMIT 50;
  `;

  pool.query(
    sql,
    [searchKey, searchKey, searchKey, searchKey, searchKey, searchKey],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;