const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');

// --- THIS IS THE NEW, CORRECTED CONFIGURATION ---
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

// Initialize the Plaid client with the new configuration
const plaidClient = new PlaidApi(configuration);
// --- END OF NEW CONFIGURATION ---


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
    console.error('Error creating link token:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to create link token' });
  }
};

module.exports = {
  createLinkToken,
};