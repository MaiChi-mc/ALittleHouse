// backend/services/logService.js
const { pool, query: queryWithRetry } = require('../services/db'); 

function addActivityLog(booking_id, action_type, description) {
  const query = `
    INSERT INTO activity_logs 
    (booking_id, action_type, description)
    VALUES (?, ?, ?)
  `;
  queryWithRetry(query, [
    booking_id,
    action_type,
    description
  ], (err) => {
    if (err) {
      console.error("Error inserting activity log:", err);
    }
  });
}

module.exports = { addActivityLog };