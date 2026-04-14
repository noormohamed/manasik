'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      router.push('/admin/dashboard');
    } catch (err: any) {
      setLocalError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '448px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', color: '#111827' }}>Admin Panel</h1>
          <p style={{ textAlign: 'center', color: '#4b5563', marginTop: '8px' }}>Sign in to your account</p>
        </div>

        {(error || localError) && (
          <div style={{ marginBottom: '16px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
            <p style={{ color: '#b91c1c', fontSize: '14px' }}>{error || localError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', opacity: isLoading ? 0.5 : 1 }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="••••••••"
              style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', opacity: isLoading ? 0.5 : 1 }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', background: isLoading ? '#a5a5a5' : '#4f46e5', color: 'white', fontWeight: '500', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>
            Demo credentials:
            <br />
            Email: admin@bookingplatform.com
            <br />
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
