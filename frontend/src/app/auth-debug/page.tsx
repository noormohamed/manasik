'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthDebugPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    // Decode token to show expiry
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        setTokenInfo({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          issuedAt: new Date(payload.iat * 1000).toLocaleString(),
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
          expiresIn: Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes',
        });
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    } else {
      setTokenInfo(null);
    }
  }, [user, isClient]);

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[Auth]') || message.includes('[API]')) {
        setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()} - ${message}`]);
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('[Auth]') || message.includes('[API]')) {
        setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()} - ERROR: ${message}`]);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  if (!isClient) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Auth Debug Dashboard</h1>

      {/* Auth State */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Auth State</h2>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? `${user.firstName} ${user.lastName} (${user.email})` : 'None'}</div>
      </div>

      {/* Token Info */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Token Info</h2>
        {tokenInfo ? (
          <>
            <div>User ID: {tokenInfo.userId}</div>
            <div>Email: {tokenInfo.email}</div>
            <div>Role: {tokenInfo.role}</div>
            <div>Issued At: {tokenInfo.issuedAt}</div>
            <div>Expires At: {tokenInfo.expiresAt}</div>
            <div style={{ color: parseInt(tokenInfo.expiresIn) < 60 ? 'red' : 'green' }}>
              Expires In: {tokenInfo.expiresIn}
            </div>
          </>
        ) : (
          <div>No token found</div>
        )}
      </div>

      {/* Storage */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Storage</h2>
        <div>
          Access Token (localStorage): {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}
        </div>
        <div>
          Refresh Token (localStorage): {localStorage.getItem('refreshToken') ? 'Present' : 'Missing'}
        </div>
        <div>
          Access Token (cookie): {getCookie('accessToken') ? 'Present' : 'Missing'}
        </div>
      </div>

      {/* Logs */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Recent Logs (Last 50)</h2>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          backgroundColor: '#f5f5f5', 
          padding: '10px',
          borderRadius: '3px'
        }}>
          {logs.length === 0 ? (
            <div>No logs yet. Navigate around the app to see auth activity.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ 
                marginBottom: '5px',
                color: log.includes('ERROR') ? 'red' : log.includes('successfully') ? 'green' : 'black'
              }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Actions</h2>
        <button
          onClick={() => window.location.reload()}
          style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          Reload Page
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            document.cookie.split(";").forEach((c) => {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            window.location.reload();
          }}
          style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#ff4444', color: 'white', border: 'none' }}
        >
          Clear All & Reload
        </button>
        <button
          onClick={() => setLogs([])}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Clear Logs
        </button>
      </div>

      {/* Instructions */}
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Instructions</h2>
        <ol style={{ marginLeft: '20px' }}>
          <li>Keep this page open in one tab</li>
          <li>Open your app in another tab</li>
          <li>Navigate around and watch the logs here</li>
          <li>Look for [Auth] and [API] prefixed messages</li>
          <li>Check if token expires and gets refreshed</li>
          <li>Verify user state is maintained</li>
        </ol>
      </div>
    </div>
  );
}
