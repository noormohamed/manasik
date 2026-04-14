"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Get redirect path from URL params
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [searchParams]);

  const validateForm = () => {
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
      await login(email, password);
      addToast('Welcome back! Login successful.', 'success');

      // Redirect to the original page or dashboard after successful login
      const destination = redirectPath || '/dashboard';
      console.log('[Login] Redirecting to:', destination);
      router.push(destination);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.error || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="login-register-form" onSubmit={handleSubmit}>
        <h4>Log In To Your Account</h4>

        {redirectPath && (
          <div className="alert alert-warning" role="alert">
            <i className="ri-information-line me-2"></i>
            Please log in to access that page.
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="ri-error-warning-line me-2"></i>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={`form-control ${error && !email ? 'is-invalid' : ''}`}
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
              className={`form-control ${error && !password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              disabled={loading}
              autoComplete="current-password"
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
        </div>

        <div className="form-group d-flex justify-content-between align-items-center">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Keep me logged in
            </label>
          </div>
          <Link href="/auth/forgot-password" className="text-decoration-none">
            Forgot password?
          </Link>
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
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </div>

        <div className="text-center mt-3">
          <p className="mb-0">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-decoration-none fw-bold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo credentials for testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="alert alert-info mt-3" role="alert">
            <small>
              <strong>Demo Credentials:</strong><br />
              Email: admin@bookingplatform.com<br />
              Password: password123
            </small>
          </div>
        )}
      </form>
    </>
  );
};

export default LoginForm;
