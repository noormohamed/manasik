"use client";

import React, { useState } from "react";
import "./ConversationAssignment.css";

interface HotelStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Conversation {
  id: string;
  subject: string;
  assignedToId?: string;
  assignedToName?: string;
}

interface ConversationAssignmentProps {
  conversation: Conversation;
  staff: HotelStaff[];
  onAssign: (staffId: string) => void;
  onClose: () => void;
}

const ConversationAssignment: React.FC<ConversationAssignmentProps> = ({
  conversation,
  staff,
  onAssign,
  onClose,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    conversation.assignedToId || ""
  );
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedStaffId) return;

    try {
      setLoading(true);
      onAssign(selectedStaffId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignment-modal-overlay" onClick={onClose}>
      <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assignment-modal-header">
          <h5>Assign Conversation</h5>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="assignment-modal-body">
          <p className="text-muted mb-3">
            Assign this conversation to a team member
          </p>

          <div className="staff-list">
            {staff.length === 0 ? (
              <p className="text-muted text-center py-4">No staff members available</p>
            ) : (
              staff.map((member) => (
                <div
                  key={member.id}
                  className={`staff-item ${
                    selectedStaffId === member.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedStaffId(member.id)}
                >
                  <div className="staff-avatar">
                    <i className="ri-user-line"></i>
                  </div>
                  <div className="staff-info">
                    <h6 className="staff-name">
                      {member.firstName} {member.lastName}
                    </h6>
                    <p className="staff-email">{member.email}</p>
                    <small className="staff-role">{member.role}</small>
                  </div>
                  <div className="staff-checkbox">
                    <input
                      type="radio"
                      name="staff"
                      value={member.id}
                      checked={selectedStaffId === member.id}
                      onChange={() => setSelectedStaffId(member.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="assignment-modal-footer">
          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAssign}
            disabled={!selectedStaffId || loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Assigning...
              </>
            ) : (
              <>
                <i className="ri-check-line me-2"></i>
                Assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationAssignment;
