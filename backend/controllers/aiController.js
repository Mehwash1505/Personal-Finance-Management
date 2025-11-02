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

// Gemini AI config - with error handling
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ CRITICAL: GEMINI_API_KEY is not set in environment variables!');
  } else {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  }
} catch (error) {
  console.error('❌ Error initializing Gemini AI:', error);
}

// Helper: Get current spending
const getCurrentSpending = async (user) => {
  let allTransactions = [];
  
  try {
    if (user.plaidAccessToken) {
      const plaidRequest = { access_token: user.plaidAccessToken };
      const plaidResponse = await plaidClient.transactionsSync(plaidRequest);
      plaidResponse.data.added.forEach(t => {
        if (t.amount > 0) allTransactions.push({ category: t.personal_finance_category.primary, amount: t.amount });
      });
    }
  } catch (plaidError) {
    console.warn('Warning: Could not fetch Plaid transactions:', plaidError.message);
    // Continue without Plaid data
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
  console.log('\n=== AI ADVISOR REQUEST STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', req.user?.id);
  console.log('User prompt:', req.body.userPrompt);
  console.log('GEMINI_API_KEY exists?', !!process.env.GEMINI_API_KEY);
  
  const { userPrompt } = req.body;
  
  if (!userPrompt) {
    console.log('❌ No prompt provided');
    return res.status(400).json({ message: 'Please ask a question.' });
  }

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not configured');
    return res.status(500).json({ 
      message: 'AI service is not configured. Please contact administrator.' 
    });
  }

  // Check if genAI was initialized
  if (!genAI) {
    console.error('❌ Gemini AI not initialized');
    return res.status(500).json({ 
      message: 'AI service initialization failed. Please contact administrator.' 
    });
  }

  try {
    console.log('Fetching user data...');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Fetching financial data...');
    const goals = await Goal.find({ user: req.user.id });
    const bills = await Bill.find({ user: req.user.id });
    const spendingSummary = await getCurrentSpending(user);
    
    console.log('Building financial profile...');
    const userFinancialProfile = `
      User Name: ${user.name}
      Budgets: ${JSON.stringify(user.budgets)}
      Savings Goals: ${JSON.stringify(goals)}
      Upcoming Bills: ${JSON.stringify(bills)}
      Recent Spending Summary: ${JSON.stringify(spendingSummary)}
    `;

    console.log('Preparing AI prompt...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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

    console.log('Calling Gemini AI...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiText = response.text();

    console.log('✅ AI response generated successfully');
    console.log('Response length:', aiText.length, 'characters');
    console.log('=== AI ADVISOR REQUEST COMPLETED ===\n');
    
    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error('\n❌ ERROR IN AI ADVISOR:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('API Error status:', error.response.status);
      console.error('API Error data:', error.response.data);
    }
    
    console.error('Full error stack:', error.stack);
    console.error('=== AI ADVISOR REQUEST FAILED ===\n');
    
    // Send appropriate error message based on error type
    let errorMessage = 'AI is sleeping, please try again later.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key configuration. Please contact administrator.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'AI service quota exceeded. Please try again later.';
    } else if (error.message?.includes('SAFETY')) {
      errorMessage = 'Your question triggered safety filters. Please rephrase your question.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { askAiAdvisor };