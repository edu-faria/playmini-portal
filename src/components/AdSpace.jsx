import React, { useEffect, useRef } from 'react';

function AdSpace({ type = 'leaderboard', position = 'top' }) {
  const adRef = useRef(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    // Only push ad once, even in Strict Mode
    if (adRef.current && !isAdPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdPushed.current = true;
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }

    // Cleanup on unmount
    return () => {
      isAdPushed.current = false;
    };
  }, []);

  const adConfig = {
    leaderboard: { 
      width: '728px', 
      height: '90px',
      slot: '1234567890', // Replace with your actual ad slot ID
      format: 'horizontal',
      responsive: true
    },
    rectangle: { 
      width: '300px', 
      height: '250px',
      slot: '0987654321', // Replace with your actual ad slot ID
      format: 'rectangle',
      responsive: true
    },
    skyscraper: { 
      width: '300px', 
      height: '600px',
      slot: '1122334455', // Replace with your actual ad slot ID
      format: 'vertical',
      responsive: true
    }
  };

  const config = adConfig[type] || adConfig.leaderboard;
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-6725938675870604';

  return (
    <div className="bg-gray-800 bg-opacity-50 py-4 text-center border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center">
          <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ 
              display: 'inline-block', 
              width: config.width, 
              height: config.height 
            }}
            data-ad-client={clientId}
            data-ad-slot={config.slot}
            data-ad-format={config.format}
            data-full-width-responsive={config.responsive.toString()}
          />
        </div>
      </div>
    </div>
  );
}

export default AdSpace;