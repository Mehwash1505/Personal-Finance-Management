import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const AskAiPage = () => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: "Hi! I'm Veritas, your financial advisor. How can I help you today?" }
  ]);
  const [prompt, setPrompt] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  // Har naye message par neeche scroll karo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt || isReplying) return;

    const userMessage = { from: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsReplying(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_BASE_URL}/api/ai/ask`, { userPrompt: prompt }, config);
      
      const aiMessage = { from: 'ai', text: res.data.response };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      toast.error("AI is sleeping, please try again later.");
      setMessages(prev => [...prev, { from: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <motion.div 
      className="container mx-auto p-4 flex flex-col h-[calc(100vh-100px)]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <h1 className="text-4xl font-bold text-text-light my-6">Ask Veritas (AI Advisor)</h1>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-surface/80 backdrop-blur-xl border border-border rounded-xl shadow-2xl">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-lg p-3 rounded-xl shadow ${
                msg.from === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-surface-dark text-text-light'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isReplying && (
          <div className="flex justify-start">
            <div className="max-w-lg p-3 rounded-xl bg-surface-dark text-text-muted">
              Veritas is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-6 flex items-center space-x-2">
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about your spending, budgets, or how to save..."
          className="flex-1 p-3 bg-surface border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
          disabled={isReplying}
        />
        <button 
          type="submit" 
          className="bg-primary text-white p-3 rounded-lg hover:bg-primary-hover disabled:opacity-50"
          disabled={!prompt || isReplying}
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </form>
    </motion.div>
  );
};

export default AskAiPage;