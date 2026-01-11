import React, { useEffect, useRef } from 'react';

function AdSpace({ type = 'leaderboard', position = 'top', slot = 'auto' }) {
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

  const sizes = {
    leaderboard: { width: 728, height: 90, format: 'horizontal' },
    rectangle: { width: 300, height: 250, format: 'rectangle' },
    skyscraper: { width: 300, height: 600, format: 'vertical' }
  };

  const adSize = sizes[type] || sizes.leaderboard;

  return (
    <div className="bg-gray-800 bg-opacity-50 py-4 text-center border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center">
          <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'inline-block', width: `${adSize.width}px`, height: `${adSize.height}px` }}
            data-ad-client="ca-pub-6725938675870604"
            data-ad-slot={slot}
            data-ad-format={adSize.format}
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  );
}

export default AdSpace;