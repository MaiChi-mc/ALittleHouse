// backend/services/logService.js
const { pool, query: queryWithRetry } = require('../services/db'); 

function addActivityLog(bookingId, actionType, description, performedBy, callback) {
  const query = `
    INSERT INTO activity_logs (booking_id, action_type, description, performed_by)
    VALUES (?, ?, ?, ?)
  `;
  queryWithRetry(query, [bookingId, actionType, description, performedBy], (err) => {
    if (err) {
      console.error("Error adding activity log:", err);
      if (callback) return callback(err);
    }
    if (callback) callback();
  });
}

module.exports = { addActivityLog };
