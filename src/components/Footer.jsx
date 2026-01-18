import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-black bg-opacity-40 backdrop-blur-sm border-t border-white border-opacity-10 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2024 PlayMini.io - Free Online Mini Games</p>
        <p className="text-sm mt-2">
          <Link to="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-yellow-400 transition">Terms of Service</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;