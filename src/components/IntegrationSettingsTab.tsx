import { API_BASE_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

export const IntegrationSettingsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/integrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setIntegrations(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (type: string, name: string) => {
    const fakeSecrets = { test: '123' }; // In real UI, open a modal to enter secrets
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_BASE_URL}/integrations`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, name, secrets: fakeSecrets })
    });
    fetchIntegrations();
  };

  const handleTest = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_BASE_URL}/integrations/${id}/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchIntegrations();
  };

  if (loading) return <div className="p-6">Loading integrations...</div>;

  const getIntegration = (type: string) => integrations.find(i => i.type === type);

  const providers = [
    { type: 'TWILIO', label: 'SMS Gateway (Twilio)' },
    { type: 'MICROSOFT_365', label: 'Email Gateway (Microsoft 365)' },
    { type: 'OPENAI', label: 'AI Engine (OpenAI)' }
  ];

  return (
    <div className="executive-panel rounded-2xl p-6 space-y-4 text-xs shadow-sm border border-[#E2E8F0]">
      <h3 className="font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
        <Shield className="w-4 h-4" /> Gateway Credentials
      </h3>
      <div className="space-y-3">
        {providers.map(p => {
          const instance = getIntegration(p.type);
          return (
            <div key={p.type} className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center text-[#0F172A]">
              <span className="font-semibold">{p.label}:</span>
              
              {instance ? (
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-bold ${instance.status === 'CONNECTED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {instance.status} ({instance.maskedCredential})
                  </span>
                  <button onClick={() => handleTest(instance.id)} className="text-[#155EEF] hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Test
                  </button>
                </div>
              ) : (
                <button onClick={() => handleConnect(p.type, p.label)} className="btn-executive-primary px-3 py-1 text-white font-bold rounded shadow-sm text-xs cursor-pointer">
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
