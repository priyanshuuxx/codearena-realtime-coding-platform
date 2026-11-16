import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import { api } from '../lib/api.js';

function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/platform/admin/summary')
      .then(({ data }) => setSummary(data.summary))
      .catch(() => setMessage('Admin summary is available only for ADMIN users.'));
  }, []);

  return (
    <AppLayout eyebrow="Admin" title="Platform Management">
      {message && <Panel>{message}</Panel>}
      {summary && (
        <div className="grid gap-5 md:grid-cols-3">
          {Object.entries(summary).map(([key, value]) => (
            <Panel key={key}>
              <p className="text-sm capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </Panel>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default AdminPage;
