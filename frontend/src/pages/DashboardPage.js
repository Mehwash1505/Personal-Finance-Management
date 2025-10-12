import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

const DashboardPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [linkToken, setLinkToken] = useState(null);

  // Function to fetch accounts
  const fetchAccounts = async () => {
    try {
      // Get user from local storage to access the token
      const user = JSON.parse(localStorage.getItem('user'));
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get('http://localhost:5001/api/plaid/accounts', config);
      setAccounts(response.data);
    } catch (error) {
      // --- REPLACE YOUR CATCH BLOCK WITH THIS ---
      if (error.response && error.response.status === 400) {
        // This is an expected case for users who haven't linked an account yet.
        // We can just set accounts to an empty array and not log an error.
        setAccounts([]);
      } else {
        // For any other unexpected error, we'll still log it.
        console.error('Failed to fetch accounts', error.response ? error.response.data : error.message);
      }
    }
  };

  // 1. Generate a link_token
  useEffect(() => {
    const generateToken = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
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
    fetchAccounts(); // Fetch accounts on initial load
  }, []);

  // 2. Handle the success of the Plaid Link flow
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      // Exchange public_token for an access_token
      const exchangeToken = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          await axios.post('http://localhost:5001/api/plaid/exchange_public_token', { public_token }, config);
          // 4. Fetch accounts again now that a new one has been linked
          fetchAccounts();
        } catch (error) {
              console.log("Inspecting the full error object:", error);
              if (error.response && error.response.status === 400) {
                  // This is an expected case for users who haven't linked an account yet.
                  // We can just set accounts to an empty array and not log an error.
                  setAccounts([]);
              } else {
                  // For any other unexpected error, we'll still log it.
                  console.error('Failed to fetch accounts', error.response ? error.response.data : error.message);
              }
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