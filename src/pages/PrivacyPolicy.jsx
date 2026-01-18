import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-yellow-400 hover:text-yellow-300 mb-6 inline-block">
        ← Back to Home
      </Link>
      
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <p className="mb-4">
              <strong>Effective Date:</strong> January 18, 2026
            </p>
            <p>
              Welcome to PlayMini.io ("we," "our," or "us"). We are committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-2 text-white">1.1 Automatically Collected Information</h3>
            <p className="mb-3">
              When you visit PlayMini.io, we may automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address</li>
              <li>Time zone setting</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4 text-white">1.2 Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold 
              certain information. Cookies are files with small amounts of data that may include an anonymous 
              unique identifier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">2. How We Use Your Information</h2>
            <p className="mb-2">We use the collected information for various purposes:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>To provide and maintain our gaming services</li>
              <li>To improve user experience</li>
              <li>To analyze website usage and trends</li>
              <li>To display personalized or non-personalized advertisements</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">3. Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold mb-2 text-white">3.1 Google AdSense</h3>
            <p className="mb-3">
              We use Google AdSense to display advertisements on our website. Google uses cookies to serve 
              ads based on your prior visits to our website or other websites. Google's use of advertising 
              cookies enables it and its partners to serve ads based on your visit to our site and/or other 
              sites on the Internet.
            </p>
            <p className="mb-3">
              You may opt out of personalized advertising by visiting{' '}
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                Google Ads Settings
              </a>.
            </p>
            <p>
              For more information about Google's privacy practices, please visit the{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                Google Privacy & Terms page
              </a>.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4 text-white">3.2 Analytics</h3>
            <p>
              We may use third-party analytics services to monitor and analyze website traffic and user behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">4. Your Data Protection Rights (GDPR)</h2>
            <p className="mb-2">
              If you are a resident of the European Economic Area (EEA), you have certain data protection rights:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Right to access:</strong> You have the right to request copies of your personal data</li>
              <li><strong>Right to rectification:</strong> You have the right to request correction of inaccurate information</li>
              <li><strong>Right to erasure:</strong> You have the right to request deletion of your personal data</li>
              <li><strong>Right to restrict processing:</strong> You have the right to request restriction of processing</li>
              <li><strong>Right to object:</strong> You have the right to object to our processing of your personal data</li>
              <li><strong>Right to data portability:</strong> You have the right to request transfer of your data</li>
              <li><strong>Right to withdraw consent:</strong> You have the right to withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">5. Children's Privacy</h2>
            <p>
              Our website does not knowingly collect personal information from children under 13. If you are 
              a parent or guardian and believe your child has provided us with personal information, please 
              contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal 
              information. However, no method of transmission over the Internet or electronic storage is 100% 
              secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email:{' '}
              <a href="mailto:privacy@playmini.io" className="text-yellow-400 hover:underline">
                privacy@playmini.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;