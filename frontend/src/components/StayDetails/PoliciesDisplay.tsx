'use client';

import React from 'react';
import { StandardPolicy, CustomPolicy, STANDARD_POLICIES } from '@/types/hotel-policies';

interface PoliciesDisplayProps {
  standardPolicies: StandardPolicy[];
  customPolicies: CustomPolicy[];
  title?: string;
}

const PoliciesDisplay: React.FC<PoliciesDisplayProps> = ({
  standardPolicies,
  customPolicies,
  title = 'Hotel Policies',
}) => {
  const enabledStandardPolicies = standardPolicies.filter(p => p.enabled);
  const enabledCustomPolicies = customPolicies.filter(p => p.enabled);

  if (enabledStandardPolicies.length === 0 && enabledCustomPolicies.length === 0) {
    return null;
  }

  return (
    <div className="policies-section mb-4">
      <h4 className="mb-3">{title}</h4>

      {/* Standard Policies */}
      {enabledStandardPolicies.length > 0 && (
        <div className="mb-4">
          <div className="row g-3">
            {enabledStandardPolicies.map((policy) => (
              <div key={policy.id} className="col-md-6">
                <div className="policy-card p-3 border rounded-lg">
                  <div className="d-flex align-items-start gap-2 mb-2">
                    <i className={`${policy.icon} text-primary`} style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <h6 className="mb-1">{policy.name}</h6>
                      <p className="text-muted small mb-0">{policy.description}</p>
                    </div>
                  </div>
                  {policy.value && (
                    <div className="mt-2 ps-4">
                      <p className="small mb-0">{policy.value}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Policies */}
      {enabledCustomPolicies.length > 0 && (
        <div>
          <h6 className="mb-2">Additional Policies</h6>
          <div className="space-y-2">
            {enabledCustomPolicies.map((policy) => (
              <div key={policy.id} className="policy-card p-3 border rounded-lg">
                <h6 className="mb-1">{policy.title}</h6>
                <p className="text-muted small mb-0">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliciesDisplay;
