
import React from 'react';
import { Card } from '../../components/common/Card';

const AdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
      <Card title="Application Configuration">
        <p className="text-gray-600">This section will allow administrators to configure various application-wide settings.</p>
        <ul className="list-disc list-inside mt-4 text-gray-600">
            <li>User role management</li>
            <li>Default match parameters</li>
            <li>Scoring rules customization (future)</li>
            <li>API Key Management (if applicable for other services)</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">Further settings options will be added in future updates.</p>
      </Card>
       <Card title="System Health">
        <p className="text-gray-600">Monitor system status and perform maintenance tasks.</p>
        <div className="mt-4">
            <p className="text-gray-700"><strong>Database Status:</strong> <span className="text-green-500 font-semibold">Connected (Mock)</span></p>
            <p className="text-gray-700"><strong>API Service:</strong> <span className="text-green-500 font-semibold">Operational (Mock)</span></p>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
