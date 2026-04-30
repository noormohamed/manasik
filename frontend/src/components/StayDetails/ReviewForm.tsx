'use client';

import React, { useState } from 'react';

interface FrictionResponses {
  liftDelays?: 1 | 2 | 3;
  crowding?: 1 | 2 | 3;
  checkin?: 1 | 2 | 3;
}

const ReviewForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
  const [frictionResponses, setFrictionResponses] = useState<FrictionResponses>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFrictionChange = (
    field: keyof FrictionResponses,
    value: number
  ) => {
    setFrictionResponses((prev) => ({
      ...prev,
      [field]: value as 1 | 2 | 3,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Validate required fields
      if (!name.trim() || !email.trim() || !review.trim()) {
        setSubmitError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Here you would submit the review and friction responses
      // For now, we'll just simulate the submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form on success
      setName('');
      setEmail('');
      setReview('');
      setFrictionResponses({});
      setSubmitSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="stay-comment-replay box-style">
        <div className="d-sm-flex align-items-end justify-content-between mb-5">
          <div className="box-title border-0 mb-0 pb-0">
            <h4>Add Your Review</h4>
            <p>Your ratings for this property</p>

            <div className="d-flex align-items-center">
              <svg
                className="me-2"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_3720_460)">
                  <path
                    d="M15.9583 6.13754C15.8536 5.81356 15.5662 5.58345 15.2262 5.55281L10.6082 5.13348L8.78208 0.859327C8.64744 0.546087 8.34079 0.343323 8.00008 0.343323C7.65938 0.343323 7.35273 0.546087 7.21808 0.86006L5.39198 5.13348L0.773211 5.55281C0.433847 5.58418 0.147219 5.81356 0.0418692 6.13754C-0.0634802 6.46152 0.0338123 6.81688 0.290533 7.04088L3.78122 10.1022L2.7519 14.6364C2.67658 14.9698 2.80598 15.3144 3.0826 15.5144C3.23128 15.6218 3.40524 15.6765 3.58066 15.6765C3.73191 15.6765 3.88193 15.6357 4.01658 15.5551L8.00008 13.1743L11.9821 15.5551C12.2735 15.7304 12.6408 15.7144 12.9168 15.5144C13.1936 15.3138 13.3229 14.9691 13.2475 14.6364L12.2182 10.1022L15.7089 7.04149C15.9656 6.81688 16.0636 6.46213 15.9583 6.13754Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
              <svg
                className="me-2"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_3720_460)">
                  <path
                    d="M15.9583 6.13754C15.8536 5.81356 15.5662 5.58345 15.2262 5.55281L10.6082 5.13348L8.78208 0.859327C8.64744 0.546087 8.34079 0.343323 8.00008 0.343323C7.65938 0.343323 7.35273 0.546087 7.21808 0.86006L5.39198 5.13348L0.773211 5.55281C0.433847 5.58418 0.147219 5.81356 0.0418692 6.13754C-0.0634802 6.46152 0.0338123 6.81688 0.290533 7.04088L3.78122 10.1022L2.7519 14.6364C2.67658 14.9698 2.80598 15.3144 3.0826 15.5144C3.23128 15.6218 3.40524 15.6765 3.58066 15.6765C3.73191 15.6765 3.88193 15.6357 4.01658 15.5551L8.00008 13.1743L11.9821 15.5551C12.2735 15.7304 12.6408 15.7144 12.9168 15.5144C13.1936 15.3138 13.3229 14.9691 13.2475 14.6364L12.2182 10.1022L15.7089 7.04149C15.9656 6.81688 16.0636 6.46213 15.9583 6.13754Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
              <svg
                className="me-2"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_3720_460)">
                  <path
                    d="M15.9583 6.13754C15.8536 5.81356 15.5662 5.58345 15.2262 5.55281L10.6082 5.13348L8.78208 0.859327C8.64744 0.546087 8.34079 0.343323 8.00008 0.343323C7.65938 0.343323 7.35273 0.546087 7.21808 0.86006L5.39198 5.13348L0.773211 5.55281C0.433847 5.58418 0.147219 5.81356 0.0418692 6.13754C-0.0634802 6.46152 0.0338123 6.81688 0.290533 7.04088L3.78122 10.1022L2.7519 14.6364C2.67658 14.9698 2.80598 15.3144 3.0826 15.5144C3.23128 15.6218 3.40524 15.6765 3.58066 15.6765C3.73191 15.6765 3.88193 15.6357 4.01658 15.5551L8.00008 13.1743L11.9821 15.5551C12.2735 15.7304 12.6408 15.7144 12.9168 15.5144C13.1936 15.3138 13.3229 14.9691 13.2475 14.6364L12.2182 10.1022L15.7089 7.04149C15.9656 6.81688 16.0636 6.46213 15.9583 6.13754Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
              <svg
                className="me-2"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_3720_460)">
                  <path
                    d="M15.9583 6.13754C15.8536 5.81356 15.5662 5.58345 15.2262 5.55281L10.6082 5.13348L8.78208 0.859327C8.64744 0.546087 8.34079 0.343323 8.00008 0.343323C7.65938 0.343323 7.35273 0.546087 7.21808 0.86006L5.39198 5.13348L0.773211 5.55281C0.433847 5.58418 0.147219 5.81356 0.0418692 6.13754C-0.0634802 6.46152 0.0338123 6.81688 0.290533 7.04088L3.78122 10.1022L2.7519 14.6364C2.67658 14.9698 2.80598 15.3144 3.0826 15.5144C3.23128 15.6218 3.40524 15.6765 3.58066 15.6765C3.73191 15.6765 3.88193 15.6357 4.01658 15.5551L8.00008 13.1743L11.9821 15.5551C12.2735 15.7304 12.6408 15.7144 12.9168 15.5144C13.1936 15.3138 13.3229 14.9691 13.2475 14.6364L12.2182 10.1022L15.7089 7.04149C15.9656 6.81688 16.0636 6.46213 15.9583 6.13754Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_3720_460)">
                  <path
                    d="M15.9583 6.13754C15.8536 5.81356 15.5662 5.58345 15.2262 5.55281L10.6082 5.13348L8.78208 0.859327C8.64744 0.546087 8.34079 0.343323 8.00008 0.343323C7.65938 0.343323 7.35273 0.546087 7.21808 0.86006L5.39198 5.13348L0.773211 5.55281C0.433847 5.58418 0.147219 5.81356 0.0418692 6.13754C-0.0634802 6.46152 0.0338123 6.81688 0.290533 7.04088L3.78122 10.1022L2.7519 14.6364C2.67658 14.9698 2.80598 15.3144 3.0826 15.5144C3.23128 15.6218 3.40524 15.6765 3.58066 15.6765C3.73191 15.6765 3.88193 15.6357 4.01658 15.5551L8.00008 13.1743L11.9821 15.5551C12.2735 15.7304 12.6408 15.7144 12.9168 15.5144C13.1936 15.3138 13.3229 14.9691 13.2475 14.6364L12.2182 10.1022L15.7089 7.04149C15.9656 6.81688 16.0636 6.46213 15.9583 6.13754Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="alert alert-success mb-4" role="alert">
            <i className="ri-check-line me-2"></i>
            Thank you! Your review has been submitted successfully.
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="alert alert-danger mb-4" role="alert">
            <i className="ri-error-warning-line me-2"></i>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6">
              <div className="form-group mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group mb-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group mb-4">
              <textarea
                className="form-control"
                placeholder="Write a review"
                cols={30}
                rows={10}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          {/* Friction Questions Section */}
          <div className="card mb-4" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                    <i className="ri-question-line me-2"></i>
                    Experience Friction
                  </h6>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                    Rate each experience 1 (Poor) · 2 (Average) · 3 (Good)
                  </p>
                </div>
                <div style={{
                  background: '#fbbf24',
                  color: '#78350f',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1 }}>
                    {frictionResponses.liftDelays && frictionResponses.crowding && frictionResponses.checkin
                      ? (((frictionResponses.liftDelays + frictionResponses.crowding + frictionResponses.checkin) / 3) * 10 / 3).toFixed(1)
                      : '—'}
                  </div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>Preview</div>
                </div>
              </div>

              {/* Question 1: Lift Delays */}
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    Lift Delays
                  </label>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                    {frictionResponses.liftDelays ? `${frictionResponses.liftDelays} – ${['', 'Poor', 'Average', 'Good'][frictionResponses.liftDelays]}` : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleFrictionChange('liftDelays', value as 1 | 2 | 3)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '6px',
                        border: frictionResponses.liftDelays === value
                          ? '2px solid #f59e0b'
                          : '2px solid #e5e7eb',
                        background: frictionResponses.liftDelays === value
                          ? '#fef3c7'
                          : '#fff',
                        color: frictionResponses.liftDelays === value
                          ? '#f59e0b'
                          : '#6b7280',
                        fontWeight: frictionResponses.liftDelays === value ? 700 : 400,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {value} · {['', 'Poor', 'Average', 'Good'][value]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Crowding */}
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    Crowding at Peak Times
                  </label>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                    {frictionResponses.crowding ? `${frictionResponses.crowding} – ${['', 'Poor', 'Average', 'Good'][frictionResponses.crowding]}` : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleFrictionChange('crowding', value as 1 | 2 | 3)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '6px',
                        border: frictionResponses.crowding === value
                          ? '2px solid #f59e0b'
                          : '2px solid #e5e7eb',
                        background: frictionResponses.crowding === value
                          ? '#fef3c7'
                          : '#fff',
                        color: frictionResponses.crowding === value
                          ? '#f59e0b'
                          : '#6b7280',
                        fontWeight: frictionResponses.crowding === value ? 700 : 400,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {value} · {['', 'Poor', 'Average', 'Good'][value]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Check-in Experience */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    Check-in Smoothness
                  </label>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                    {frictionResponses.checkin ? `${frictionResponses.checkin} – ${['', 'Poor', 'Average', 'Good'][frictionResponses.checkin]}` : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleFrictionChange('checkin', value as 1 | 2 | 3)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '6px',
                        border: frictionResponses.checkin === value
                          ? '2px solid #f59e0b'
                          : '2px solid #e5e7eb',
                        background: frictionResponses.checkin === value
                          ? '#fef3c7'
                          : '#fff',
                        color: frictionResponses.checkin === value
                          ? '#f59e0b'
                          : '#6b7280',
                        fontWeight: frictionResponses.checkin === value ? 700 : 400,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {value} · {['', 'Poor', 'Average', 'Good'][value]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="default-btn active rounded-10 border-0"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ReviewForm;
