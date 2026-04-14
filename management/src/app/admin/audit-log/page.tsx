'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Simulate loading audit logs
    setLogs([]);
    setLoading(false);
  }, []);

  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'admin', label: 'Admin' },
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'details', label: 'Details' },
  ];

  if (loading) {
    return <div className="p-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-gray-600 mt-2">Administrative actions and system events</p>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No audit logs available yet
          </div>
        ) : (
          <DataTable columns={columns} data={logs} />
        )}
      </div>
    </div>
  );
}
