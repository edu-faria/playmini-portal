import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home, Menu, X } from 'lucide-react';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition"
        >
          <Gamepad2 size={32} className="text-yellow-400" />
          <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-transparent bg-clip-text">
            PlayMini.io
          </span>
        </Link>

        <button 
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/"
            className="flex items-center gap-2 hover:text-yellow-400 transition"
          >
            <Home size={20} />
            Home
          </Link>
          <a href="#about" className="hover:text-yellow-400 transition">About</a>
          <a href="#contact" className="hover:text-yellow-400 transition">Contact</a>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black bg-opacity-50 backdrop-blur-sm border-t border-white border-opacity-10">
          <nav className="flex flex-col p-4 gap-3">
            <Link 
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 hover:text-yellow-400 transition"
            >
              <Home size={20} />
              Home
            </Link>
            <a href="#about" className="hover:text-yellow-400 transition">About</a>
            <a href="#contact" className="hover:text-yellow-400 transition">Contact</a>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;