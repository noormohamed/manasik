'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

const CATEGORY_LABELS = [
  { key: 'location',           label: 'Location',            description: 'Walking time, gate proximity, route ease' },
  { key: 'pilgrimSuitability', label: 'Pilgrim Suitability', description: 'Elderly, wheelchair, family, room practicality' },
  { key: 'hotelQuality',       label: 'Hotel Quality',       description: 'Cleanliness, comfort, service' },
  { key: 'experienceFriction', label: 'Experience Friction', description: 'Lifts, crowding, check-in smoothness' },
  { key: 'userReviews',        label: 'User Reviews',        description: 'Verified guest review average' },
] as const;

type WeightKey = typeof CATEGORY_LABELS[number]['key'];

interface Weights {
  location: number;
  pilgrimSuitability: number;
  hotelQuality: number;
  experienceFriction: number;
  userReviews: number;
}

const DEFAULT_WEIGHTS: Weights = {
  location: 35,
  pilgrimSuitability: 25,
  hotelQuality: 20,
  experienceFriction: 10,
  userReviews: 10,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Booking Platform',
    supportEmail: 'support@bookingplatform.com',
    timezone: 'UTC',
    sessionTimeout: 24,
    enableMFA: false,
    enableAuditLog: true,
  });

  // Scoring weights state
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [weightsLoading, setWeightsLoading] = useState(true);
  const [weightsSaving, setWeightsSaving] = useState(false);
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [weightsSaved, setWeightsSaved] = useState(false);

  const weightTotal = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightsValid = Math.abs(weightTotal - 100) < 0.01;

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const res = await apiClient.get<{ weights: Weights }>('/api/hotels/scoring-weights');
        if (res?.weights) setWeights(res.weights);
      } catch {
        // Use defaults if fetch fails
      } finally {
        setWeightsLoading(false);
      }
    };
    fetchWeights();
  }, []);

  const handleWeightChange = (key: WeightKey, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setWeights(prev => ({ ...prev, [key]: num }));
    }
    setWeightsError(null);
    setWeightsSaved(false);
  };

  const handleSaveWeights = async () => {
    if (!weightsValid) {
      setWeightsError(`Weights must sum to 100 (current: ${weightTotal.toFixed(1)})`);
      return;
    }
    setWeightsSaving(true);
    setWeightsError(null);
    setWeightsSaved(false);
    try {
      await apiClient.put('/api/hotels/scoring-weights', weights);
      setWeightsSaved(true);
      setTimeout(() => setWeightsSaved(false), 3000);
    } catch (err: any) {
      setWeightsError(err?.message || 'Failed to save weights');
    } finally {
      setWeightsSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert('Settings saved successfully');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Configure admin panel settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option>UTC</option>
                <option>EST</option>
                <option>CST</option>
                <option>PST</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableMFA}
                onChange={(e) => handleChange('enableMFA', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm font-medium">Enable Multi-Factor Authentication</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableAuditLog}
                onChange={(e) => handleChange('enableAuditLog', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm font-medium">Enable Audit Logging</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>

      {/* ── Manasik Score Weights ───────────────────────────────────────── */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold">Manasik Score Weights</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure the percentage contribution of each category to the overall Manasik score.
              All five values must sum to exactly 100.
            </p>
          </div>
          {/* Running total badge */}
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${
              weightsValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            Total: {weightTotal.toFixed(1)}%
          </span>
        </div>

        {weightsLoading ? (
          <p className="text-sm text-gray-400">Loading current weights…</p>
        ) : (
          <div className="mt-4 space-y-4">
            {CATEGORY_LABELS.map(({ key, label, description }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-gray-400">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={weights[key]}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className="w-20 px-2 py-1 border rounded-md text-sm text-right"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            ))}

            {weightsError && (
              <p className="text-sm text-red-600">{weightsError}</p>
            )}
            {weightsSaved && (
              <p className="text-sm text-green-600">Weights saved successfully.</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveWeights}
                disabled={weightsSaving || !weightsValid}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {weightsSaving ? 'Saving…' : 'Save Weights'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
