const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');
const User = require('../models/User.js'); // Import the User model

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

const createLinkToken = async (req, res) => {
    // ... (your existing createLinkToken function)
};


// --- ADD THE TWO NEW FUNCTIONS BELOW ---

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

    // Save the credentials to the user's document in the database
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


module.exports = {
  createLinkToken,
  exchangePublicToken, // Export the new function
  getTransactions,      // Export the new function
};