const User = require('../models/User');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../config/mailer');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Plaid client ko yahan bhi initialize karna padega
const configuration = new Configuration({ /* ... (Plaid config object) ... */ });
const plaidClient = new PlaidApi(configuration);


// Logic to get current spending (from plaidController)
const getCurrentSpending = async (user) => {
  let allTransactions = [];
  if (user.plaidAccessToken) {
    const plaidRequest = { access_token: user.plaidAccessToken };
    const plaidResponse = await plaidClient.transactionsSync(plaidRequest);
    plaidResponse.data.added.forEach(t => {
      if (t.amount > 0) allTransactions.push({ category: t.personal_finance_category.primary, amount: t.amount });
    });
  }
  const manualTransactions = await Transaction.find({ user: user._id, type: 'expense' });
  manualTransactions.forEach(t => allTransactions.push({ category: t.category, amount: t.amount }));

  const summary = allTransactions.reduce((acc, curr) => {
    const category = curr.category || 'UNCATEGORIZED';
    acc[category] = (acc[category] || 0) + curr.amount;
    return acc;
  }, {});
  
  return summary;
};

// 1. Bill Reminders Check
const checkBillReminders = async (user) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));
  const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));

  const upcomingBills = await Bill.find({
    user: user._id,
    dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
  });

  for (const bill of upcomingBills) {
    console.log(`Sending bill reminder to ${user.email} for ${bill.name}`);
    await sendEmail({
      to: user.email,
      subject: `Upcoming Bill Reminder: ${bill.name}`,
      text: `Hi ${user.name},\n\nThis is a reminder that your bill for ${bill.name} (Amount: $${bill.amount}) is due tomorrow, ${new Date(bill.dueDate).toLocaleDateString()}.\n\n- PFM Dashboard`,
      html: `<p>Hi ${user.name},</p><p>This is a reminder that your bill for <b>${bill.name}</b> (Amount: <b>$${bill.amount}</b>) is due tomorrow, ${new Date(bill.dueDate).toLocaleDateString()}.</p><p>- PFM Dashboard</p>`,
    });
  }
};

// 2. Budget Alerts Check
const checkBudgetAlerts = async (user) => {
  const spending = await getCurrentSpending(user);
  
  for (const budget of user.budgets) {
    const spent = spending[budget.category] || 0;
    const percentage = (spent / budget.limit) * 100;

    // Check if over 90% and not already alerted (advanced logic)
    if (percentage >= 90) {
      console.log(`Sending budget alert to ${user.email} for ${budget.category}`);
      await sendEmail({
        to: user.email,
        subject: `Budget Alert: ${budget.category}`,
        text: `Hi ${user.name},\n\nYou have spent $${spent.toFixed(2)} of your $${budget.limit} budget for ${budget.category} (${percentage.toFixed(0)}%).\n\n- PFM Dashboard`,
        html: `<p>Hi ${user.name},</p><p>You have spent <b>$${spent.toFixed(2)}</b> of your <b>$${budget.limit}</b> budget for ${budget.category} (<b>${percentage.toFixed(0)}%</b>).</p><p>- PFM Dashboard</p>`,
      });
    }
  }
};


// Main function jo sabko check karega
const runChecks = async () => {
  console.log('Running daily notification checks...');
  const users = await User.find({});

  for (const user of users) {
    if (user.notificationPreferences.sendBillAlerts) {
      await checkBillReminders(user);
    }
    if (user.notificationPreferences.sendBudgetAlerts) {
      await checkBudgetAlerts(user);
    }
  }
  console.log('Daily checks complete.');
};

module.exports = { runChecks };