'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setAuthenticated, setToken } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import Link from 'next/link';

export default function MFAVerifyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { tempToken, requiresMFA, isLoading, error } = useAppSelector((state) => state.auth);

  const [mfaCode, setMfaCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [codeError, setCodeError] = useState('');

  // Redirect if no temp token
  useEffect(() => {
    if (!tempToken || !requiresMFA) {
      router.push('/admin/login');
    }
  }, [tempToken, requiresMFA, router]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setMfaCode(value);
    setCodeError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setCodeError('');

    // Validate MFA code
    if (!mfaCode || mfaCode.length !== 6) {
      setCodeError('Please enter a valid 6-digit code');
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await authService.verifyMFA(mfaCode, tempToken!);

      if (response.success) {
        dispatch(setToken(response.token));
        dispatch(setAuthenticated(true));
        router.push('/admin/dashboard');
      } else {
        setLocalError(response.error || 'MFA verification failed');
      }
    } catch (err) {
      setLocalError('An error occurred during MFA verification');
      console.error('MFA verification error:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResendCode = async () => {
    // In a real implementation, this would resend the code via email or SMS
    setLocalError('Code resent to your registered email');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
            <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
          </div>

          {/* Error Messages */}
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{localError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* MFA Code Input */}
            <div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Code
              </label>
              <input
                id="mfaCode"
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  codeError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || mfaCode.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend Code Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Resend
              </button>
            </p>
          </div>

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Super Admin Panel</p>
        </div>
      </div>
    </div>
  );
}
