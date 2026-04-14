"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { apiClient } from "@/lib/api";

import author from "/public/images/author/author-18.jpg";

const AccountInfo = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.put(`/users/${user?.id}`, {
        firstName,
        lastName,
      });
      await refreshUser();
      setSuccess('Profile updated successfully');
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      const errorMsg = err.error || 'Failed to update profile';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="box-title">
        <h3 className="mb-0">Account information</h3>
      </div>

      <div className="d-sm-flex">
        <div className="flex-shrink-0 mb-3 mb-sm-0">
          <Image
            src={author}
            className="rounded-circle"
            alt="author"
            style={{ width: '120px', height: '120px' }}
          />
          <input type="file" style={{ display: 'block', fontSize: '13px', marginTop: '20px' }} />
        </div>
        
        <div className="flex-grow-1 ms-sm-4">
          <form className="account-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
              />
            </div>

            <div className="form-group mb-0">
              <button
                type="submit"
                className="default-btn rounded-10 active border-0"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountInfo;
