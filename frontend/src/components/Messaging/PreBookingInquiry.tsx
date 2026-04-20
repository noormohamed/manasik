"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import "./PreBookingInquiry.css";

interface PreBookingInquiryProps {
  hotelId: string;
  hotelName: string;
  onSuccess?: () => void;
}

const PreBookingInquiry: React.FC<PreBookingInquiryProps> = ({
  hotelId,
  hotelName,
  onSuccess,
}) => {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!description.trim()) {
      setError("Message is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = (await apiClient.post("/messages/conversations", {
        hotelId,
        subject,
        description,
        participants: [
          // Hotel staff will be added by the hotel
        ],
      })) as { data?: { id: string } };

      if (response.data?.id) {
        setSuccess(true);
        setSubject("");
        setDescription("");

        // Redirect to messages page after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/messages");
          onSuccess?.();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error creating inquiry:", err);
      setError(err.error || "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pre-booking-inquiry">
        <div className="alert alert-success" role="alert">
          <i className="ri-check-circle-line me-2"></i>
          <strong>Inquiry sent!</strong>
          <p className="mb-0 mt-2">
            The hotel will respond to your inquiry shortly. You can view your messages in the
            Messages section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pre-booking-inquiry">
      <div className="inquiry-card">
        <h4>Send Inquiry to {hotelName}</h4>
        <p className="text-muted">
          Have questions before booking? Send a message to the hotel and they'll get back to you
          shortly.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="subject" className="form-label">
              Subject <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="subject"
              placeholder="e.g., Room availability, Special requests"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              maxLength={255}
            />
            <small className="text-muted">{subject.length} / 255</small>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Message <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              id="description"
              placeholder="Tell the hotel about your inquiry..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={5}
              maxLength={5000}
            />
            <small className="text-muted">{description.length} / 5000</small>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !subject.trim() || !description.trim()}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line me-2"></i>
                  Send Inquiry
                </>
              )}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </form>

        <div className="inquiry-tips mt-4">
          <h6>Tips for your inquiry:</h6>
          <ul className="small text-muted">
            <li>Be specific about your needs or questions</li>
            <li>Include your preferred dates if applicable</li>
            <li>Mention any special requests or requirements</li>
            <li>The hotel will respond within 24 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreBookingInquiry;
