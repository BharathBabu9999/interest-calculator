import Accordion from './Accordion';

export default function PrivacyPolicy() {
  return (
    <Accordion title="Privacy Policy">
      <div id="privacy">
      
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        <strong>Last Updated:</strong> March 1, 2026
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Overview</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        This is a self-hosted, private application. All data is stored in a PostgreSQL database on your own server.
        No data is shared with third parties, advertising networks, or analytics services.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Data Storage</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        Your financial data is stored server-side in a PostgreSQL database that you control. This includes:
      </p>
      <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 mb-4 space-y-1">
        <li>Account credentials (email address and bcrypt-hashed password — plain-text passwords are never stored)</li>
        <li>Client records: names, contact details, notes, and currency preferences</li>
        <li>Transaction records: dates, amounts, interest rates, types, and completion status</li>
        <li>Uploaded files: stored on the server filesystem under your uploads directory</li>
      </ul>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        Two small items are stored in your browser's <code>localStorage</code>:
      </p>
      <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 mb-4 space-y-1">
        <li>Your JWT session token (used to authenticate API requests; expires after 7 days)</li>
        <li>Your dark/light theme preference</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Authentication</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        An account is required to use this application. Sessions are managed with signed JSON Web Tokens (JWT).
        Tokens expire after 7 days and are stored only in your browser's localStorage — they are never sent to any
        third-party service.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Data Access</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        Each user's data is fully isolated — you can only read and modify your own clients and transactions.
        Access to the underlying database requires direct server access, which is controlled by whoever hosts
        the application.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Third-Party Services</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        This application does not integrate any third-party analytics, advertising, or tracking services.
        No data is transmitted to external parties.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Your Data Rights</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        Because this is self-hosted, you have full control over your data:
      </p>
      <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 mb-4 space-y-1">
        <li>Export transactions at any time as CSV or PDF</li>
        <li>Delete individual transactions, clients, or uploaded files from the UI</li>
        <li>Delete your account and all associated data directly from the database</li>
        <li>Clear your session by logging out (removes the JWT from localStorage)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 mt-6 dark:text-white">Changes to This Policy</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-4">
        This policy may be updated as the application evolves. Changes will be reflected in the "Last Updated" date above.
      </p>

      <p className="text-sm text-gray-500 dark:text-slate-400 mt-6">
        By using this application, you acknowledge that you have read and understood this Privacy Policy.
      </p>
      </div>
    </Accordion>
  );
}
