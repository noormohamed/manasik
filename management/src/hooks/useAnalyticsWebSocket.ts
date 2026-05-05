'use client';

/**
 * useAnalyticsWebSocket
 *
 * Custom React hook that manages a WebSocket connection to the analytics
 * server for real-time dashboard updates. Handles authentication,
 * incremental delta merging, token refresh, exponential backoff
 * reconnection, and cleanup on unmount.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  AnalyticsResponse,
  AnalyticsEvent,
  TokenRefreshedEvent,
  ConnectionStatus,
} from '@/types/analytics';
import { mergeDelta } from '@/utils/mergeDelta';
import { analyticsService } from '@/services/analyticsService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_RECONNECT_DELAY = 1_000; // 1 second
const MAX_RECONNECT_DELAY = 30_000; // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive the WebSocket base URL from the API URL environment variable.
 * Converts http(s) to ws(s) and falls back to ws://localhost:3001.
 */
function getWsBaseUrl(): string {
  const apiUrl =
    (typeof process !== 'undefined' &&
      process.env?.NEXT_PUBLIC_API_URL) ||
    'http://localhost:3001';

  return apiUrl.replace(/^http/, 'ws');
}

/**
 * Calculate exponential backoff delay for a given attempt number.
 *
 * Formula: min(1000 * 2^attempt, 30000)
 */
export function calculateBackoffDelay(attempt: number): number {
  return Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempt), MAX_RECONNECT_DELAY);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAnalyticsWebSocketReturn {
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
}

export function useAnalyticsWebSocket(
  data: AnalyticsResponse | null,
  setData: React.Dispatch<React.SetStateAction<AnalyticsResponse | null>>,
): UseAnalyticsWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Refs to survive across renders without triggering re-renders
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  const dataRef = useRef<AnalyticsResponse | null>(data);

  // Keep dataRef in sync with the latest data prop
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ------------------------------------------------------------------
  // Full data refresh (used after reconnection)
  // ------------------------------------------------------------------
  const refreshData = useCallback(async () => {
    try {
      const freshData = await analyticsService.getAnalytics(
        dataRef.current?.meta?.range ?? 30,
      );
      if (mountedRef.current) {
        setData(freshData);
      }
    } catch {
      // Refresh failure is non-fatal; the next delta or manual action
      // will eventually bring the data up to date.
    }
  }, [setData]);

  // ------------------------------------------------------------------
  // Clear any pending reconnect timer
  // ------------------------------------------------------------------
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ------------------------------------------------------------------
  // Connect to the WebSocket server
  // ------------------------------------------------------------------
  const connect = useCallback(() => {
    // Guard: don't connect if unmounted
    if (!mountedRef.current) return;

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('admin_token')
      : null;

    if (!token) {
      setConnectionStatus('disconnected');
      return;
    }

    const wsUrl = `${getWsBaseUrl()}/ws/analytics?token=${encodeURIComponent(token)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // --- onopen ---
      ws.onopen = () => {
        if (!mountedRef.current) return;
        attemptRef.current = 0; // reset consecutive failures
        setConnectionStatus('connected');

        // If we're reconnecting (not the first connect), refresh data
        // to re-sync state after the gap.
        if (dataRef.current !== null) {
          refreshData();
        }
      };

      // --- onmessage ---
      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;

        let parsed: AnalyticsEvent | TokenRefreshedEvent;
        try {
          parsed = JSON.parse(event.data as string);
        } catch {
          // Invalid JSON — ignore per design doc
          return;
        }

        // Handle token refresh event
        if (parsed.eventType === 'auth:tokenRefreshed') {
          const tokenEvent = parsed as TokenRefreshedEvent;
          if (tokenEvent.data?.token && typeof window !== 'undefined') {
            localStorage.setItem('admin_token', tokenEvent.data.token);
          }
          return;
        }

        // Handle analytics delta event
        const analyticsEvent = parsed as AnalyticsEvent;
        if (analyticsEvent.delta) {
          setData((prev) => {
            const merged = mergeDelta(prev, analyticsEvent.delta);
            // If merge returns null (missing baseline), trigger a full
            // refresh in the background and keep current state for now.
            if (merged === null) {
              refreshData();
              return prev;
            }
            return merged;
          });
        }
      };

      // --- onclose ---
      ws.onclose = () => {
        if (!mountedRef.current) return;
        wsRef.current = null;

        // Check if we've exhausted reconnection attempts
        if (attemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('disconnected');
          return;
        }

        setConnectionStatus('reconnecting');

        const delay = calculateBackoffDelay(attemptRef.current);
        attemptRef.current += 1;

        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect();
          }
        }, delay);
      };

      // --- onerror ---
      ws.onerror = () => {
        // The browser will fire onclose after onerror, so reconnection
        // logic is handled there. Nothing extra needed here.
      };
    } catch {
      // WebSocket constructor can throw for invalid URLs
      setConnectionStatus('disconnected');
    }
  }, [clearReconnectTimer, refreshData, setData]);

  // ------------------------------------------------------------------
  // Manual reconnect (exposed to consumers)
  // ------------------------------------------------------------------
  const reconnect = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent auto-reconnect from firing
      wsRef.current.close();
      wsRef.current = null;
    }

    clearReconnectTimer();
    attemptRef.current = 0;
    setConnectionStatus('reconnecting');
    connect();
  }, [clearReconnectTimer, connect]);

  // ------------------------------------------------------------------
  // Lifecycle: connect on mount, clean up on unmount
  // ------------------------------------------------------------------
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearReconnectTimer();

      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearReconnectTimer]);

  return { connectionStatus, reconnect };
}
