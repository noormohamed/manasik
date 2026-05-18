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

interface TaxRate {
  territory: string;
  rate: number;
  description?: string;
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

  // Rebate (platform commission) state
  const [rebatePercent, setRebatePercent] = useState<number>(15);
  const [rebateLoading, setRebateLoading] = useState(true);
  const [rebateSaving, setRebateSaving] = useState(false);
  const [rebateError, setRebateError] = useState<string | null>(null);
  const [rebateSaved, setRebateSaved] = useState(false);

  // Scoring weights state
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [weightsLoading, setWeightsLoading] = useState(true);
  const [weightsSaving, setWeightsSaving] = useState(false);
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [weightsSaved, setWeightsSaved] = useState(false);

  // Tax rates state
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [taxLoading, setTaxLoading] = useState(true);
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [taxSaved, setTaxSaved] = useState(false);
  const [newTaxTerritory, setNewTaxTerritory] = useState('');
  const [newTaxRate, setNewTaxRate] = useState('');
  const [newTaxDescription, setNewTaxDescription] = useState('');
  const [editingTerritory, setEditingTerritory] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');

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

    const fetchRebate = async () => {
      try {
        const res: any = await apiClient.get('/api/admin/settings/rebate');
        const value = res?.rebatePercent ?? res?.data?.rebatePercent;
        if (value !== undefined) setRebatePercent(value);
      } catch {
        // Use default 15% if fetch fails
      } finally {
        setRebateLoading(false);
      }
    };
    fetchRebate();

    const fetchTaxRates = async () => {
      try {
        const res: any = await apiClient.get('/api/admin/settings/tax-rates');
        const rates = res?.taxRates ?? res?.data?.taxRates;
        if (rates) setTaxRates(rates);
      } catch {
        // Use empty array if fetch fails
      } finally {
        setTaxLoading(false);
      }
    };
    fetchTaxRates();
  }, []);

  const handleWeightChange = (key: WeightKey, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setWeights(prev => ({ ...prev, [key]: num }));
    }
    setWeightsError(null);
    setWeightsSaved(false);
  };

  const handleSaveRebate = async () => {
    if (rebatePercent < 0 || rebatePercent > 100) {
      setRebateError('Rebate must be between 0% and 100%');
      return;
    }
    setRebateSaving(true);
    setRebateError(null);
    setRebateSaved(false);
    try {
      await apiClient.put('/api/admin/settings/rebate', { rebatePercent });
      setRebateSaved(true);
      setTimeout(() => setRebateSaved(false), 3000);
    } catch (err: any) {
      setRebateError(err?.message || 'Failed to save rebate setting');
    } finally {
      setRebateSaving(false);
    }
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

  const handleAddTaxRate = async () => {
    const territory = newTaxTerritory.trim().toUpperCase();
    const rate = parseFloat(newTaxRate);

    if (!territory) {
      setTaxError('Territory code is required (e.g., GB, US-NY)');
      return;
    }
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setTaxError('Rate must be between 0 and 100');
      return;
    }

    setTaxSaving(true);
    setTaxError(null);
    setTaxSaved(false);
    try {
      await apiClient.put('/api/admin/settings/tax-rates', {
        territory,
        rate: rate / 100, // Convert percentage to decimal
        description: newTaxDescription.trim() || undefined,
      });
      // Update local state
      setTaxRates(prev => {
        const existing = prev.findIndex(t => t.territory === territory);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { territory, rate: rate / 100, description: newTaxDescription.trim() || undefined };
          return updated;
        }
        return [...prev, { territory, rate: rate / 100, description: newTaxDescription.trim() || undefined }];
      });
      setNewTaxTerritory('');
      setNewTaxRate('');
      setNewTaxDescription('');
      setTaxSaved(true);
      setTimeout(() => setTaxSaved(false), 3000);
    } catch (err: any) {
      setTaxError(err?.message || 'Failed to save tax rate');
    } finally {
      setTaxSaving(false);
    }
  };

  const handleUpdateTaxRate = async (territory: string) => {
    const rate = parseFloat(editRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setTaxError('Rate must be between 0 and 100');
      return;
    }

    setTaxSaving(true);
    setTaxError(null);
    try {
      const existing = taxRates.find(t => t.territory === territory);
      await apiClient.put('/api/admin/settings/tax-rates', {
        territory,
        rate: rate / 100,
        description: existing?.description,
      });
      setTaxRates(prev => prev.map(t =>
        t.territory === territory ? { ...t, rate: rate / 100 } : t
      ));
      setEditingTerritory(null);
      setEditRate('');
      setTaxSaved(true);
      setTimeout(() => setTaxSaved(false), 3000);
    } catch (err: any) {
      setTaxError(err?.message || 'Failed to update tax rate');
    } finally {
      setTaxSaving(false);
    }
  };

  const handleDeleteTaxRate = async (territory: string) => {
    if (!confirm(`Remove tax rate for ${territory}?`)) return;

    setTaxSaving(true);
    setTaxError(null);
    try {
      await apiClient.delete(`/api/admin/settings/tax-rates/${territory}`);
      setTaxRates(prev => prev.filter(t => t.territory !== territory));
      setTaxSaved(true);
      setTimeout(() => setTaxSaved(false), 3000);
    } catch (err: any) {
      setTaxError(err?.message || 'Failed to delete tax rate');
    } finally {
      setTaxSaving(false);
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

      {/* ── Platform Rebate (Commission) ──────────────────────────────── */}
      <div className="border rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Platform Rebate</h2>
          <p className="text-sm text-gray-500 mt-1">
            The percentage of each booking that the platform retains as commission.
            This is applied to the booking subtotal before tax.
          </p>
        </div>

        {rebateLoading ? (
          <p className="text-sm text-gray-400">Loading rebate settings…</p>
        ) : (
          <div className="space-y-6">
            {/* Current rebate input */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-48">
                Commission Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={rebatePercent}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setRebatePercent(val);
                      setRebateError(null);
                      setRebateSaved(false);
                    }
                  }}
                  className="w-24 px-3 py-2 border rounded-md text-right"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Calculation breakdown */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">How the calculation works</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">1.</span>
                  <p>
                    <span className="font-medium text-gray-800">Booking subtotal</span> is calculated as:
                    <code className="ml-1 bg-white px-1.5 py-0.5 rounded border text-xs">
                      room price × nights × quantity
                    </code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">2.</span>
                  <p>
                    <span className="font-medium text-gray-800">Platform rebate</span> is deducted:
                    <code className="ml-1 bg-white px-1.5 py-0.5 rounded border text-xs">
                      rebate = subtotal × {rebatePercent}%
                    </code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">3.</span>
                  <p>
                    <span className="font-medium text-gray-800">Hotel receives</span>:
                    <code className="ml-1 bg-white px-1.5 py-0.5 rounded border text-xs">
                      subtotal − rebate = subtotal × {(100 - rebatePercent).toFixed(1)}%
                    </code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">4.</span>
                  <p>
                    <span className="font-medium text-gray-800">Tax</span> is applied separately on the full booking total shown to the guest.
                  </p>
                </div>
              </div>

              {/* Example calculation */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Example</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <span className="text-gray-500">Booking subtotal:</span>
                  <span className="font-medium">£1,000.00</span>
                  <span className="text-gray-500">Platform rebate ({rebatePercent}%):</span>
                  <span className="font-medium text-indigo-600">£{(1000 * rebatePercent / 100).toFixed(2)}</span>
                  <span className="text-gray-500">Hotel payout ({(100 - rebatePercent).toFixed(1)}%):</span>
                  <span className="font-medium text-green-600">£{(1000 * (100 - rebatePercent) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Broker bookings note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Note:</span> For broker-sourced bookings, an additional broker fee is set per booking by the agent.
                The platform rebate is calculated on the subtotal <em>before</em> the broker fee is added.
              </p>
            </div>

            {rebateError && (
              <p className="text-sm text-red-600">{rebateError}</p>
            )}
            {rebateSaved && (
              <p className="text-sm text-green-600">Rebate setting saved successfully.</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveRebate}
                disabled={rebateSaving || rebatePercent < 0 || rebatePercent > 100}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {rebateSaving ? 'Saving…' : 'Save Rebate'}
              </button>
            </div>
          </div>
        )}
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

      {/* ── Territory Tax Rates ────────────────────────────────────────── */}
      <div className="border rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Territory Tax Rates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure tax rates applied to bookings based on the hotel&apos;s territory.
            Rates are matched by exact territory code first (e.g., US-NY), then fall back to country code (e.g., US).
          </p>
        </div>

        {taxLoading ? (
          <p className="text-sm text-gray-400">Loading tax rates…</p>
        ) : (
          <div className="space-y-4">
            {/* Current rates table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-gray-600">Territory</th>
                    <th className="pb-2 font-medium text-gray-600">Description</th>
                    <th className="pb-2 font-medium text-gray-600 text-right">Rate</th>
                    <th className="pb-2 font-medium text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taxRates.map((tr) => (
                    <tr key={tr.territory} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-xs font-medium">{tr.territory}</td>
                      <td className="py-2 text-gray-500">{tr.description || '—'}</td>
                      <td className="py-2 text-right">
                        {editingTerritory === tr.territory ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.01}
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                              className="w-20 px-2 py-1 border rounded text-right text-xs"
                              autoFocus
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        ) : (
                          <span className="font-medium">{(tr.rate * 100).toFixed(2)}%</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        {editingTerritory === tr.territory ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateTaxRate(tr.territory)}
                              disabled={taxSaving}
                              className="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingTerritory(null); setEditRate(''); }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingTerritory(tr.territory); setEditRate((tr.rate * 100).toFixed(2)); }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTaxRate(tr.territory)}
                              disabled={taxSaving}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {taxRates.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">
                        No tax rates configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add new rate */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add / Update Territory Rate</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Territory Code</label>
                  <input
                    type="text"
                    placeholder="e.g., GB, US-NY"
                    value={newTaxTerritory}
                    onChange={(e) => setNewTaxTerritory(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    placeholder="e.g., 20"
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., United Kingdom"
                    value={newTaxDescription}
                    onChange={(e) => setNewTaxDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddTaxRate}
                    disabled={taxSaving || !newTaxTerritory || !newTaxRate}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {taxSaving ? 'Saving…' : 'Add Rate'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                If a territory already exists, it will be updated with the new rate.
              </p>
            </div>

            {taxError && (
              <p className="text-sm text-red-600">{taxError}</p>
            )}
            {taxSaved && (
              <p className="text-sm text-green-600">Tax rate saved successfully.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
