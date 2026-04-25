"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

const RegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(email, password, firstName, lastName);
      addToast('Account created successfully! Welcome aboard.', 'success');
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMsg = err.error || err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="login-register-form" onSubmit={handleSubmit}>
        <h4>Create An Account</h4>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="ri-error-warning-line me-2"></i>
            {error}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="form-control"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setError('');
                }}
                required
                disabled={loading}
                autoComplete="given-name"
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="form-control"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setError('');
                }}
                required
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="position-relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={{ textDecoration: 'none' }}
            >
              <i className={`ri-eye-${showPassword ? 'off' : ''}line`}></i>
            </button>
          </div>
          <small className="form-text text-muted">
            Must be at least 6 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="position-relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              style={{ textDecoration: 'none' }}
            >
              <i className={`ri-eye-${showConfirmPassword ? 'off' : ''}line`}></i>
            </button>
          </div>
        </div>

        <div className="form-group">
          <button
            type="submit"
            className="default-btn active rounded-10 w-100 text-center d-block border-0"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : (
              'Register Now'
            )}
          </button>
        </div>

        <div className="text-center mt-3">
          <p className="mb-0">
            Already have an account?{' '}
            <Link href="/auth" className="text-decoration-none fw-bold">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
