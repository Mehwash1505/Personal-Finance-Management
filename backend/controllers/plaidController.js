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
  // --- ADDED LOGGING STATEMENTS FOR DEBUGGING ---
  console.log('--- Inside createLinkToken controller ---');
  try {
    console.log('User ID:', req.user.id); // Log the user ID to ensure it's there
    const request = {
      user: {
        client_user_id: req.user.id,
      },
      client_name: 'PFM Dashboard',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    console.log('About to call Plaid API...');
    const response = await plaidClient.linkTokenCreate(request);
    console.log('...Plaid API call successful!'); // <-- We are checking if it reaches this line

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

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
  getAccounts,
};