// backend/routes/cronJobs.js
const express = require("express");
const cron = require("node-cron");
const { pool, query: queryWithRetry } = require("../services/db"); // Sử dụng queryWithRetry
const { addActivityLog } = require("../services/logService");

const router = express.Router();

/** ------------------------------- Queries ------------------------------- */
const autoCheckinQuery = `
  SELECT booking_id, room_number
  FROM bookings
  WHERE booking_status <> 'Checked-in'
    AND check_in <= CURDATE()
    AND check_out >= CURDATE();
`;

const autoCheckoutQuery = `
  SELECT booking_id, room_number
  FROM bookings
  WHERE check_out < CURDATE()
    AND booking_status = 'Checked-in';
`;

const autoFixRoomStatusQuery = `
  SELECT r.room_id
  FROM rooms r
  LEFT JOIN (
    SELECT room_id
    FROM bookings
    WHERE booking_status = 'Checked-in'
  ) AS active_bookings ON r.room_id = active_bookings.room_id
  WHERE active_bookings.room_id IS NULL
    AND r.status = 'Occupied';
`;

/** ------------------------------- Helper: run query with retry ------------------------------- */
function runSafeQuery(sql, params = [], cb) {
  queryWithRetry(sql, params, (err, result) => {
    if (err && err.code === "ER_LOCK_DEADLOCK") {
      console.warn("Deadlock detected, retrying...");
      return queryWithRetry(sql, params, cb); // Thử lại một lần (hạn chế retry đơn giản)
    }
    cb(err, result);
  });
}

/** ------------------------------- Manual APIs ------------------------------- */
router.put("/auto-checkin", (req, res) => {
  queryWithRetry(autoCheckinQuery, (err, bookings) => {
    if (err) {
      console.error("Auto check-in error:", err);
      return res.status(500).json({ message: "Lỗi cập nhật trạng thái check-in" });
    }

    if (bookings.length > 0) {
      queryWithRetry(
        `UPDATE bookings SET booking_status = 'Checked-in' WHERE booking_status <> 'Checked-in' AND check_in <= CURDATE() AND check_out >= CURDATE()`,
        (err) => {
          if (err) {
            console.error("Auto check-in update error:", err);
            return res.status(500).json({ message: "Lỗi cập nhật trạng thái check-in" });
          }

          bookings.forEach((b) => {
            addActivityLog(
              b.booking_id,
              null,
              "update_booking",
              `Hệ thống tự động check-in - Phòng ${b.room_number}`,
              "cronJob",
              () => {}
            );
          });

          res.json({
            message: "Đã auto check-in cho các booking đến hạn",
            affectedRows: bookings.length,
          });
        }
      );
    } else {
      res.json({
        message: "Đã auto check-in cho các booking đến hạn",
        affectedRows: 0,
      });
    }
  });
});

router.put("/auto-checkout", (req, res) => {
  queryWithRetry(autoCheckoutQuery, (err, bookings) => {
    if (err) {
      console.error("Auto check-out error:", err);
      return res.status(500).json({ message: "Lỗi cập nhật trạng thái check-out" });
    }

    if (bookings.length > 0) {
      queryWithRetry(
        `UPDATE bookings SET booking_status = 'Checked-out' WHERE check_out < CURDATE() AND booking_status = 'Checked-in'`,
        (err) => {
          if (err) {
            console.error("Auto check-out update error:", err);
            return res.status(500).json({ message: "Lỗi cập nhật trạng thái check-out" });
          }

          bookings.forEach((b) => {
            addActivityLog(
              b.booking_id,
              null,
              "update_booking",
              `Hệ thống tự động check-out - Phòng ${b.room_number}`,
              "cronJob",
              () => {}
            );
          });

          res.json({
            message: "Đã auto check-out cho các booking đến hạn",
            affectedRows: bookings.length,
          });
        }
      );
    } else {
      res.json({
        message: "Đã auto check-out cho các booking đến hạn",
        affectedRows: 0,
      });
    }
  });
});

router.put("/auto-fix-rooms", (req, res) => {
  queryWithRetry(autoFixRoomStatusQuery, (err, rooms) => {
    if (err) {
      console.error("Auto fix room status error:", err);
      return res.status(500).json({ message: "Lỗi cập nhật trạng thái phòng" });
    }

    if (rooms.length > 0) {
      queryWithRetry(
        `UPDATE rooms r LEFT JOIN (SELECT room_id FROM bookings WHERE booking_status = 'Checked-in') AS active_bookings ON r.room_id = active_bookings.room_id SET r.status = 'Available' WHERE active_bookings.room_id IS NULL AND r.status = 'Occupied'`,
        (err) => {
          if (err) {
            console.error("Auto fix room status update error:", err);
            return res.status(500).json({ message: "Lỗi cập nhật trạng thái phòng" });
          }

          rooms.forEach((r) => {
            addActivityLog(
              null,
              r.room_id,
              "update_room",
              `Hệ thống tự động sửa trạng thái phòng ${r.room_id}`,
              "cronJob",
              () => {}
            );
          });

          res.json({
            message: "Đã tự động sửa trạng thái phòng sai",
            affectedRows: rooms.length,
          });
        }
      );
    } else {
      res.json({
        message: "Đã tự động sửa trạng thái phòng sai",
        affectedRows: 0,
      });
    }
  });
});

/** ------------------------------- Cron schedule ------------------------------- */
cron.schedule("0 0 * * *", () => {
  // Auto Check-in
  queryWithRetry(autoCheckinQuery, (err, bookingsCheckin) => {
    if (err) {
      console.error("Cron check-in error:", err);
      return;
    }
    if (bookingsCheckin.length > 0) {
      queryWithRetry(
        `UPDATE bookings SET booking_status = 'Checked-in' WHERE booking_status <> 'Checked-in' AND check_in <= CURDATE() AND check_out >= CURDATE()`,
        (err) => {
          if (err) {
            console.error("Cron check-in update error:", err);
            return;
          }
          bookingsCheckin.forEach((b) => {
            addActivityLog(
              b.booking_id,
              null,
              "update_booking",
              `Hệ thống tự động check-in - Phòng ${b.room_number}`,
              "cronJob",
              () => {}
            );
          });
        }
      );
    }

    // Auto Check-out
    queryWithRetry(autoCheckoutQuery, (err, bookingsCheckout) => {
      if (err) {
        console.error("Cron check-out error:", err);
        return;
      }
      if (bookingsCheckout.length > 0) {
        queryWithRetry(
          `UPDATE bookings SET booking_status = 'Checked-out' WHERE check_out < CURDATE() AND booking_status = 'Checked-in'`,
          (err) => {
            if (err) {
              console.error("Cron check-out update error:", err);
              return;
            }
            bookingsCheckout.forEach((b) => {
              addActivityLog(
                b.booking_id,
                null,
                "update_booking",
                `Hệ thống tự động check-out - Phòng ${b.room_number}`,
                "cronJob",
                () => {}
              );
            });
          }
        );
      }

      // Auto Fix Rooms
      queryWithRetry(autoFixRoomStatusQuery, (err, rooms) => {
        if (err) {
          console.error("Cron fix room error:", err);
          return;
        }
        if (rooms.length > 0) {
          queryWithRetry(
            `UPDATE rooms r LEFT JOIN (SELECT room_id FROM bookings WHERE booking_status = 'Checked-in') AS active_bookings ON r.room_id = active_bookings.room_id SET r.status = 'Available' WHERE active_bookings.room_id IS NULL AND r.status = 'Occupied'`,
            (err) => {
              if (err) {
                console.error("Cron fix room update error:", err);
                return;
              }
              rooms.forEach((r) => {
                addActivityLog(
                  null,
                  r.room_id,
                  "update_room",
                  `Hệ thống tự động sửa trạng thái phòng ${r.room_id}`,
                  "cronJob",
                  () => {}
                );
              });
            }
          );
        }
      });
    });
  });
});

module.exports = router;