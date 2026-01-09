import React from 'react';

function AdSpace({ type = 'leaderboard', position = 'top' }) {
  const sizes = {
    leaderboard: '728x90',
    rectangle: '300x250',
    skyscraper: '300x600'
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 py-4 text-center border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 text-gray-400">
          {/* Replace this div with actual Google AdSense code */}
          [Advertisement Space - {sizes[type]} {position}]
        </div>
      </div>
    </div>
  );
}

export default AdSpace;