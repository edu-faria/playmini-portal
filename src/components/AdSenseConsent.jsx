// src/components/AdSenseConsent.jsx

import { useEffect } from 'react';

export default function AdSenseConsent() {
  useEffect(() => {
    // Get AdSense IDs from environment variables
    const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || import.meta.env.VITE_ADSENSE_CLIENT_ID;
    const fundingChoicesId = import.meta.env.VITE_ADSENSE_FC_ID;

    if (!publisherId) {
      console.error('AdSense Publisher ID not found in environment variables. Add VITE_ADSENSE_CLIENT_ID or VITE_ADSENSE_PUBLISHER_ID to your .env file.');
      return;
    }

    console.log('✅ AdSense Publisher ID loaded:', publisherId);

    // Load AdSense script
    const adsenseScript = document.createElement('script');
    adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    adsenseScript.async = true;
    adsenseScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsenseScript);

    // Load Funding Choices (Consent Management) if ID is provided
    let fcScript = null;
    let fcPresentScript = null;
    
    if (fundingChoicesId) {
      console.log('✅ Loading Funding Choices with ID:', fundingChoicesId);
      
      fcScript = document.createElement('script');
      fcScript.src = `https://fundingchoicesmessages.google.com/i/${fundingChoicesId}?ers=1`;
      fcScript.async = true;
      document.head.appendChild(fcScript);

      // Signal Google FC Present
      fcPresentScript = document.createElement('script');
      fcPresentScript.text = `
        (function() {
          function signalGooglefcPresent() {
            if (!window.frames['googlefcPresent']) {
              if (document.body) {
                const iframe = document.createElement('iframe');
                iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
                iframe.style.display = 'none';
                iframe.name = 'googlefcPresent';
                document.body.appendChild(iframe);
              } else {
                setTimeout(signalGooglefcPresent, 0);
              }
            }
          }
          signalGooglefcPresent();
        })();
      `;
      document.head.appendChild(fcPresentScript);

      // Cleanup function
      return () => {
        document.head.removeChild(adsenseScript);
        if (fcScript && document.head.contains(fcScript)) {
          document.head.removeChild(fcScript);
        }
        if (fcPresentScript && document.head.contains(fcPresentScript)) {
          document.head.removeChild(fcPresentScript);
        }
      };
    } else {
      console.warn('⚠️ Funding Choices ID not found. Consent banner may not appear. Add VITE_ADSENSE_FC_ID to your .env file.');
      console.log('📖 To find your FC ID: AdSense → Privacy & messaging → Your message → Look for implementation code');
      
      // Cleanup without FC
      return () => {
        document.head.removeChild(adsenseScript);
      };
    }
  }, []);

  return null; // This component doesn't render anything
}