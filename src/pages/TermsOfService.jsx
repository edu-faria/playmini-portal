import React from 'react';
import { Link } from 'react-router-dom';

function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-yellow-400 hover:text-yellow-300 mb-6 inline-block">
        ← Back to Home
      </Link>
      
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <p className="mb-4">
              <strong>Effective Date:</strong> January 18, 2026
            </p>
            <p>
              Welcome to PlayMini.io. By accessing or using our website, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PlayMini.io, you accept and agree to be bound by the terms and provision 
              of this agreement. These Terms of Service apply to all visitors, users, and others who access 
              or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">2. Use of Service</h2>
            
            <h3 className="text-xl font-semibold mb-2 text-white">2.1 Permitted Use</h3>
            <p className="mb-3">
              You may use PlayMini.io for personal, non-commercial entertainment purposes. You agree to use 
              the website only for lawful purposes and in accordance with these Terms.
            </p>

            <h3 className="text-xl font-semibold mb-2 text-white">2.2 Prohibited Activities</h3>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Use the service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Use automated systems (bots, scrapers) to access the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Reverse engineer, decompile, or disassemble any part of the service</li>
              <li>Remove or modify any copyright, trademark, or proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">3. Intellectual Property Rights</h2>
            <p className="mb-3">
              The content, games, features, and functionality on PlayMini.io are owned by us or our licensors 
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or 
              exploit any of our content without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">4. User-Generated Content</h2>
            <p className="mb-3">
              If we allow user-generated content (such as scores, comments, or reviews), you retain ownership 
              of your content but grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
              and display such content.
            </p>
            <p>
              You are responsible for any content you submit and must ensure it does not violate any laws or 
              third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">5. Third-Party Links and Advertisements</h2>
            <p className="mb-3">
              Our website may contain links to third-party websites and display advertisements from third parties 
              (including Google AdSense). We are not responsible for the content, privacy policies, or practices 
              of any third-party sites or services.
            </p>
            <p>
              We do not endorse or assume responsibility for any third-party advertisements or linked websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">6. Disclaimer of Warranties</h2>
            <p className="mb-3">
              PlayMini.io is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, 
              either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Non-infringement of intellectual property</li>
              <li>Freedom from viruses or other harmful components</li>
              <li>Accuracy, reliability, or availability of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, PlayMini.io and its owners, employees, agents, and 
              affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss 
              of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Your access to or use of (or inability to use) the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Unauthorized access, use, or alteration of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">8. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless PlayMini.io and its affiliates from any claims, 
              liabilities, damages, losses, and expenses arising from your violation of these Terms or your use 
              of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">9. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the service (or any part thereof) at any 
              time without notice. We shall not be liable to you or any third party for any modification, 
              suspension, or discontinuance of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">10. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms at any time. Changes will be effective 
              immediately upon posting. Your continued use of the service after any changes constitutes your 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which PlayMini.io operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">12. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain 
              in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              Email:{' '}
              <a href="mailto:legal@playmini.io" className="text-yellow-400 hover:underline">
                legal@playmini.io
              </a>
            </p>
          </section>

          <section className="pt-6 border-t border-white border-opacity-20">
            <p className="text-sm text-gray-400">
              By using PlayMini.io, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;