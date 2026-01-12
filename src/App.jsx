import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdSpace from './components/AdSpace';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import AdSenseConsent from './components/AdSenseConsent'

function App() {
  return (
    <>
      <AdSenseConsent />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col">
        <Header />
        
        <AdSpace type="leaderboard" position="top" />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:gameId" element={<GamePage />} />
          </Routes>
        </main>
        
        <AdSpace type="leaderboard" position="bottom" />
        
        <Footer />
      </div>
    </>
  );
}

export default App;