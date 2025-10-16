const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');
const User = require('../models/User.js');

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
      products: [Products.Transactions],
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

    // Process the data for the chart
    const summary = transactions.reduce((acc, curr) => {
      // We only want to track expenses (positive amounts in Plaid)
      if (curr.amount > 0) {
        const category = curr.personal_finance_category.primary;
        acc[category] = (acc[category] || 0) + curr.amount;
      }
      return acc;
    }, {});

    // Convert the summary object to an array that Recharts can use
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

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
  getAccounts,
  getDataSummary, // <-- Add this to your exports
};