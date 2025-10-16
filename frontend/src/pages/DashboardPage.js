import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

const DashboardPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [linkToken, setLinkToken] = useState(null);

  // This function fetches the user's linked bank accounts.
  const fetchAccounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) return; // Guard clause

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get('http://localhost:5001/api/plaid/accounts', config);
      setAccounts(response.data);
    } catch (error) {
      // This is the correct place to gracefully handle the "no token" error.
      if (error.response && error.response.data && error.response.data.message === 'Plaid access token not found.') {
        // This is expected if the user has no linked accounts yet. Do nothing.
        setAccounts([]);
      } else {
        // Log any other unexpected errors.
        console.error('Failed to fetch accounts', error.response ? error.response.data : error.message);
      }
    }
  };

  // This hook runs once when the component mounts.
  useEffect(() => {
    // 1. Generate a link_token for the Plaid Link component.
    const generateToken = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.post('http://localhost:5001/api/plaid/create_link_token', {}, config);
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error('Failed to create link token', error);
      }
    };
    
    generateToken();
    fetchAccounts(); // Fetch accounts on the initial page load.
  }, []);

  // 2. Initialize the Plaid Link flow.
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      // This function runs when the user successfully links an account.
      const exchangeToken = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          // 3. Exchange the public_token for an access_token.
          await axios.post('http://localhost:5001/api/plaid/exchange_public_token', { public_token }, config);
          // 4. Fetch the accounts list again to show the newly linked account.
          fetchAccounts();
        } catch (error) {
          // This catch block handles errors during the token exchange.
          console.error('Failed to exchange public token', error.response ? error.response.data : error.message);
        }
      };
      exchangeToken();
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <button onClick={() => open()} disabled={!ready} className="my-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
        Link a Bank Account
      </button>

      <div className="mt-5">
        <h2 className="text-2xl font-semibold">My Accounts</h2>
        {accounts.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {accounts.map((account) => (
              <li key={account.account_id} className="p-4 bg-gray-100 rounded-md">
                <p className="font-bold">{account.name}</p>
                <p>Type: {account.subtype}</p>
                <p>Balance: ${account.balances.current.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no accounts linked yet.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;