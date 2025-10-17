import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Message from '../components/Message';
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); // Get the login function from context
  const { name, email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userData = {
      name,
      email,
      password,
    };

    try {
      const response = await axios.post('http://localhost:5001/api/users/register', userData);

      if (response.data) {
        // --- THIS IS THE FIX ---
        // Instead of localStorage.setItem, we call the global login function.
        // This updates the state for the whole app, including the Navbar.
        login(response.data);
        // --- END OF FIX ---
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-5 text-center">Register</h1>
      
      {error && <Message>{error}</Message>}
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
        />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;