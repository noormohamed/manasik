'use client';

import React, { useState } from 'react';
import { CustomPolicy } from '@/types/hotel-policies';

interface HotelRulesEditorProps {
  rules: CustomPolicy[];
  onRulesChange: (rules: CustomPolicy[]) => void;
  disabled?: boolean;
}

const HotelRulesEditor: React.FC<HotelRulesEditorProps> = ({
  rules,
  onRulesChange,
  disabled = false,
}) => {
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');

  const handleAddRule = () => {
    if (!newRuleTitle.trim()) return;

    const newRule: CustomPolicy = {
      id: `rule-${Date.now()}`,
      title: newRuleTitle,
      description: newRuleDescription,
      enabled: true,
    };

    onRulesChange([...rules, newRule]);
    setNewRuleTitle('');
    setNewRuleDescription('');
    setShowAddRule(false);
  };

  const handleRemoveRule = (ruleId: string) => {
    onRulesChange(rules.filter(r => r.id !== ruleId));
  };

  const handleRuleToggle = (ruleId: string) => {
    const updated = rules.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    onRulesChange(updated);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="border-bottom pb-2 mb-0 flex-grow-1">Hotel Rules</h6>
        {!showAddRule && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowAddRule(true)}
            disabled={disabled}
          >
            <i className="ri-add-line me-1"></i>
            Add Rule
          </button>
        )}
      </div>

      {rules.length === 0 && !showAddRule && (
        <p className="text-muted small">No hotel rules added yet.</p>
      )}

      {rules.map((rule) => (
        <div key={rule.id} className="border rounded-lg p-3 mb-2">
          <div className="d-flex align-items-start gap-3">
            <div className="form-check mt-1">
              <input
                className="form-check-input"
                type="checkbox"
                id={`rule-${rule.id}`}
                checked={rule.enabled}
                onChange={() => handleRuleToggle(rule.id)}
                disabled={disabled}
              />
            </div>
            <div className="flex-grow-1">
              <label className="form-check-label fw-bold" htmlFor={`rule-${rule.id}`}>
                {rule.title}
              </label>
              <p className="text-muted small mb-0">{rule.description}</p>
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleRemoveRule(rule.id)}
              disabled={disabled}
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      ))}

      {showAddRule && (
        <div className="border rounded-lg p-3 bg-light">
          <div className="mb-3">
            <label className="form-label">Rule Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., No Smoking"
              value={newRuleTitle}
              onChange={(e) => setNewRuleTitle(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Describe this rule..."
              value={newRuleDescription}
              onChange={(e) => setNewRuleDescription(e.target.value)}
              disabled={disabled}
              rows={2}
            />
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddRule}
              disabled={disabled || !newRuleTitle.trim()}
            >
              <i className="ri-check-line me-1"></i>
              Add
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setShowAddRule(false);
                setNewRuleTitle('');
                setNewRuleDescription('');
              }}
              disabled={disabled}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelRulesEditor;
