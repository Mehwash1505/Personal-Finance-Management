const cron = require('node-cron');
const { runChecks } = require('./notificationService');

// works at 9 in the morning (every day)
// ('0 9 * * *' = 0th minute, 9th hour, every day, every month, every day of week)
const startCronJobs = () => {
  cron.schedule('0 9 * * *', () => {
    runChecks();
  }, {
    timezone: "Asia/Kolkata" // Aapka timezone
  });
  
  console.log('⏰ Cron jobs scheduled. Will run daily at 9:00 AM Kolkata time.');
};

module.exports = { startCronJobs };