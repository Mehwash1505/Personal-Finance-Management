const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');
const User = require('../models/User.js');
const Transaction = require('../models/Transaction.js');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, 
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// @desc    Create a link_token for Plaid Link initialization
// @route   POST /api/plaid/create_link_token
// @access  Private
const createLinkToken = async (req, res) => {
  try {
    const request = {
      user: {
        client_user_id: req.user.id,
      },
      client_name: 'PFM Dashboard',
      products: [Products.Transactions, Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    };
    const response = await plaidClient.linkTokenCreate(request);
    res.json(response.data);
  } catch (error) {
    console.error('ERROR in createLinkToken:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to create link token' });
  }
};

// @desc    Exchange a public_token for an access_token
// @route   POST /api/plaid/exchange_public_token
// @access  Private
const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    await User.findByIdAndUpdate(req.user.id, {
      plaidAccessToken: accessToken,
      plaidItemId: itemId,
    });

    res.status(200).json({ message: 'Access token saved successfully.' });
  } catch (error) {
    console.error('Error exchanging public token:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to exchange public token.' });
  }
};

// @desc    Fetch transactions for a user
// @route   GET /api/plaid/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }

    const request = {
      access_token: user.plaidAccessToken,
    };
    const response = await plaidClient.transactionsSync(request);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transactions:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
};

// @desc    Get accounts for a user
// @route   GET /api/plaid/accounts
// @access  Private
const getAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }

    const request = {
      access_token: user.plaidAccessToken,
    };
    const response = await plaidClient.accountsGet(request);
    res.json(response.data.accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch accounts.' });
  }
};

// @desc    Get a summary of spending by category
// @route   GET /api/plaid/summary
// @access  Private
const getDataSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }

    const request = { access_token: user.plaidAccessToken };
    const response = await plaidClient.transactionsSync(request);
    const transactions = response.data.added;

    const summary = transactions.reduce((acc, curr) => {
      if (curr.amount > 0) {
        const category = curr.personal_finance_category.primary;
        acc[category] = (acc[category] || 0) + curr.amount;
      }
      return acc;
    }, {});

    const chartData = Object.keys(summary).map(key => ({
      name: key,
      value: parseFloat(summary[key].toFixed(2)),
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching summary:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch summary.' });
  }
};

// @desc    Get monthly income vs. expense summary
// @route   GET /api/plaid/monthly-summary
// @access  Private
const getMonthlySummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }

    const request = { access_token: user.plaidAccessToken };
    const response = await plaidClient.transactionsSync(request);
    const transactions = response.data.added;

    const monthlyData = transactions.reduce((acc, t) => {
      const month = t.date.substring(0, 7); // Get "YYYY-MM"
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.amount < 0) { // Inflow/Income in Plaid is a negative amount
        acc[month].income += Math.abs(t.amount);
      } else { // Outflow/Expense
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {});

    const chartData = Object.keys(monthlyData).map(monthStr => {
      const date = new Date(monthStr + '-02'); // Use day 2 to avoid timezone issues
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        Income: parseFloat(monthlyData[monthStr].income.toFixed(2)),
        Expenses: parseFloat(monthlyData[monthStr].expenses.toFixed(2)),
      };
    }).sort((a, b) => new Date(a.month) - new Date(b.month));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching monthly summary:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch monthly summary.' });
  }
};

// @desc    Get user's net worth
// @route   GET /api/plaid/net-worth
// @access  Private
const getNetWorth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }

    const request = { access_token: user.plaidAccessToken };
    const response = await plaidClient.accountsGet(request);
    const accounts = response.data.accounts;

    let assets = 0;
    let liabilities = 0;

    accounts.forEach(account => {
      const type = account.type;
      const balance = account.balances.current;

      if (type === 'depository' || type === 'investment' || type === 'brokerage') {
        assets += balance;
      } else if (type === 'credit' || type === 'loan') {
        liabilities += balance;
      }
    });

    const netWorth = assets - liabilities;

    res.json({
      assets: parseFloat(assets.toFixed(2)),
      liabilities: parseFloat(liabilities.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
    });

  } catch (error) {
    console.error('Error fetching net worth:', error);
    res.status(500).json({ message: 'Failed to fetch net worth.' });
  }
};

// @desc    Get investment holdings for a user
// @route   GET /api/plaid/investments
// @access  Private
const getInvestments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }

    const request = { access_token: user.plaidAccessToken };
    const response = await plaidClient.investmentsHoldingsGet(request);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ message: 'Failed to fetch investments.' });
  }
};

// Helper function (isko notificationService.js se copy kar lo ya yahan rakho)
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

// @desc    Calculate Financial Health Score
// @route   GET /api/plaid/health-score
// @access  Private
const getHealthScore = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: 'Plaid access token not found.' });
    }
    const accountsResponse = await plaidClient.accountsGet({ access_token: user.plaidAccessToken });
    const creditAccounts = accountsResponse.data.accounts.filter(acc => acc.type === 'credit');
    let totalCreditLimit = 0;
    let totalCreditUsage = 0;
    creditAccounts.forEach(acc => {
      if (acc.balances.limit) { 
        totalCreditLimit += acc.balances.limit;
        totalCreditUsage += acc.balances.current;
      }
    });
    let creditScore = 30;
    if (totalCreditLimit > 0) {
      const utilization = (totalCreditUsage / totalCreditLimit);
      if (utilization > 0.3) creditScore = 15;
      if (utilization > 0.7) creditScore = 5;
    }
    const plaidRequest = { access_token: user.plaidAccessToken };
    const plaidResponse = await plaidClient.transactionsSync(plaidRequest);
    const transactions = plaidResponse.data.added;
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(t => {
      if (t.amount < 0) totalIncome += Math.abs(t.amount); 
      if (t.amount > 0) totalExpenses += t.amount;
    });
    let savingsScore = 0;
    if (totalIncome > 0) {
        const savingsRate = (totalIncome - totalExpenses) / totalIncome;
        if (savingsRate > 0.2) savingsScore = 30; 
        else if (savingsRate > 0) savingsScore = 15; 
    }
    const spending = await getCurrentSpending(user); 
    let budgetScore = 0;
    if (user.budgets && user.budgets.length > 0) {
      let budgetsMet = 0;
      user.budgets.forEach(budget => {
        const spent = spending[budget.category] || 0;
        if (spent <= budget.limit) {
          budgetsMet++;
        }
      });
      budgetScore = (budgetsMet / user.budgets.length) * 40;
    } else {
      budgetScore = 10; 
    }
    const finalScore = Math.round(creditScore + savingsScore + budgetScore);
    res.json({ score: finalScore, creditScore, savingsScore, budgetScore });
  } catch (error) {
    console.error('Error calculating health score:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to calculate score.' });
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
  getAccounts,
  getDataSummary,
  getMonthlySummary, //Add this to your exports
  getNetWorth,
  getInvestments,
  getHealthScore,
};
