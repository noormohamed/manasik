"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { apiClient } from "@/lib/api";

const ChangePassword = () => {
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match';
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
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess('Password changed successfully');
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err.error || 'Failed to change password';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="box-title">
        <h3 className="mb-0">Change Password</h3>
      </div>
 
      <form className="account-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="***"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="***"
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
            placeholder="***"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
  
        <div className="form-group mb-0">
          <button
            type="submit"
            className="default-btn rounded-10 active border-0"
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </>
  );
};

export default ChangePassword;
