// File: frontend/src/components/Loader.js
import React from 'react';
import './Loader.css'; // Loader ki CSS import karo

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <span className="loader-letter">L</span>
      <span className="loader-letter">o</span>
      <span className="loader-letter">a</span>
      <span className="loader-letter">d</span>
      <span className="loader-letter">i</span>
      <span className="loader-letter">n</span>
      <span className="loader-letter">g</span>
      <span className="loader-letter">.</span>
      <span className="loader-letter">.</span>
      <span className="loader-letter">.</span>
      <div className="loader"></div>
    </div>
  );
};

export default Loader;