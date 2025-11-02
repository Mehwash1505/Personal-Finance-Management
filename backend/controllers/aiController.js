const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Bill = require('../models/Bill');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Plaid client config
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(plaidConfig);

// Gemini AI config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: Get current spending
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

// @desc    Ask the AI financial advisor
// @route   POST /api/ai/ask
// @access  Private
const askAiAdvisor = async (req, res) => {
  const { userPrompt } = req.body;
  if (!userPrompt) {
    return res.status(400).json({ message: 'Please ask a question.' });
  }

  try {
    const user = await User.findById(req.user.id);
    const goals = await Goal.find({ user: req.user.id });
    const bills = await Bill.find({ user: req.user.id });
    const spendingSummary = await getCurrentSpending(user);
    
    // 1. Saara data simple text mein convert karo
    const userFinancialProfile = `
      User Name: ${user.name}
      Budgets: ${JSON.stringify(user.budgets)}
      Savings Goals: ${JSON.stringify(goals)}
      Upcoming Bills: ${JSON.stringify(bills)}
      Recent Spending Summary: ${JSON.stringify(spendingSummary)}
    `;

    // 2. AI ke liye main prompt taiyar karo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `
      You are "Veritas", a professional and friendly AI financial advisor for a Personal Finance Management app.
      A user is asking for advice.
      Analyze the user's financial profile provided below and answer their question directly, in a helpful and concise (short, 2-3 sentences) way.
      Use simple Hinglish or English language.
      Do not just repeat the data; give actionable insights.

      ---
      USER'S FINANCIAL PROFILE:
      ${userFinancialProfile}
      ---

      USER'S QUESTION:
      "${userPrompt}"
    `;

    // 3. AI ko call karo
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiText = response.text();

    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error('Error with AI Advisor:', error);
    res.status(500).json({ message: 'AI is sleeping, please try again later.' });
  }
};

module.exports = { askAiAdvisor };