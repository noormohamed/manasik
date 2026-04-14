"use client";

import React, { useState } from "react";
import { useToast } from "@/components/Toast";
import { apiClient } from "@/lib/api";
import Link from "next/link";

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      addToast('Password reset link sent to your email', 'success');
      setStep('reset');
    } catch (err: any) {
      const errorMsg = err.error || 'Failed to send reset link';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    if (newPassword.length < 8) {
      const msg = 'Password must be at least 8 characters';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token: resetToken,
        newPassword,
      });
      addToast('Password reset successfully', 'success');
      setStep('email');
      setEmail('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err.error || 'Failed to reset password';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-register-area ptb-175">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              {step === 'email' ? (
                <form className="login-register-form" onSubmit={handleEmailSubmit}>
                  <h4>Forgot your Password</h4>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <button
                      type="submit"
                      className="default-btn active rounded-10 w-100 text-center d-block border-0"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                      <br />
                      <Link href="/auth" className="text-decoration-none">
                          Already have an account? <strong>Log in</strong>
                      </Link>

                      <br />
                      <Link href="/auth/register" className="text-decoration-none">
                          Don't have an account? <strong>Sign up</strong>
                      </Link>

                  </div>
                </form>
              ) : (
                <form className="login-register-form" onSubmit={handleResetSubmit}>
                  <h4>Reset Password</h4>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="form-group">
                    <label>Reset Token (from email)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter token from email"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <button
                      type="submit"
                      className="default-btn active rounded-10 w-100 text-center d-block border-0"
                      disabled={loading}
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>

                  <div className="form-group">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => {
                        setStep('email');
                        setError('');
                      }}
                    >
                      Back to email
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
