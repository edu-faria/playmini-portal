import React from 'react';

function Footer() {
  return (
    <footer className="bg-black bg-opacity-40 backdrop-blur-sm border-t border-white border-opacity-10 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2024 PlayMini.io - Free Online Mini Games</p>
        <p className="text-sm mt-2">
          <a href="#privacy" className="hover:text-yellow-400 transition">Privacy Policy</a>
          {' · '}
          <a href="#terms" className="hover:text-yellow-400 transition">Terms of Service</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;