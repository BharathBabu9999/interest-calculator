export default function PrivacyPolicy() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6" id="privacy">
      <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
      
      <p className="text-gray-700 mb-4">
        <strong>Last Updated:</strong> November 29, 2025
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Your Privacy Matters</h3>
      <p className="text-gray-700 mb-4">
        We are committed to protecting your privacy. This Interest Calculator is designed with privacy as a priority. 
        We do not collect, store, or transmit any of your personal financial data to our servers.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Data Storage</h3>
      <p className="text-gray-700 mb-4">
        All transaction data, client information, and calculations are stored locally in your web browser using browser 
        storage technology. This means:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        <li>Your data never leaves your device</li>
        <li>We cannot access your financial information</li>
        <li>Your calculations remain completely private</li>
        <li>Data is only accessible on the device and browser where you entered it</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 mt-6">Cookies and Tracking</h3>
      <p className="text-gray-700 mb-4">
        We use cookies and similar technologies only for:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        <li>Maintaining your session and preferences</li>
        <li>Analytics to understand how users interact with the calculator (anonymized data only)</li>
        <li>Advertising purposes through Google AdSense (if applicable)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 mt-6">Third-Party Services</h3>
      <p className="text-gray-700 mb-4">
        This website may use third-party services including:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        <li><strong>Google Analytics:</strong> To understand website usage patterns (anonymized)</li>
        <li><strong>Google AdSense:</strong> To display relevant advertisements</li>
        <li><strong>Hosting Provider:</strong> To deliver the website to your browser</li>
      </ul>
      <p className="text-gray-700 mb-4">
        These services have their own privacy policies and may collect certain information as described in their 
        respective policies.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Your Data Rights</h3>
      <p className="text-gray-700 mb-4">
        Since all data is stored locally on your device, you have complete control:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        <li>You can clear all data by clearing your browser's storage</li>
        <li>You can export your data using the CSV export function</li>
        <li>You can delete individual transactions at any time</li>
        <li>No account or registration is required to use this tool</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 mt-6">Children's Privacy</h3>
      <p className="text-gray-700 mb-4">
        This service is not directed to children under the age of 13. We do not knowingly collect personal information 
        from children.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Changes to Privacy Policy</h3>
      <p className="text-gray-700 mb-4">
        We may update this privacy policy from time to time. Any changes will be posted on this page with an updated 
        revision date.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Contact</h3>
      <p className="text-gray-700 mb-4">
        If you have questions about this privacy policy, please contact us through the website.
      </p>

      <p className="text-sm text-gray-500 mt-6">
        By using this Interest Calculator, you acknowledge that you have read and understood this Privacy Policy.
      </p>
    </div>
  );
}
