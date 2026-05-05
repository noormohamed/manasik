'use client';

import type { ConnectionStatus } from '@/types/analytics';

export interface ConnectionStatusIndicatorProps {
  /** Current WebSocket connection status */
  status: ConnectionStatus;
  /** Callback to manually trigger a reconnection attempt */
  onReconnect?: () => void;
  /** Whether the maximum reconnection attempts have been exhausted */
  maxRetriesReached?: boolean;
}

export default function ConnectionStatusIndicator({
  status,
  onReconnect,
  maxRetriesReached = false,
}: ConnectionStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Status dot + label */}
      <div className="flex items-center gap-1.5">
        {status === 'connected' && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-xs text-gray-500">Live</span>
          </>
        )}

        {status === 'reconnecting' && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500" />
            </span>
            <span className="text-xs text-yellow-600">Reconnecting</span>
          </>
        )}

        {status === 'disconnected' && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-xs text-red-600">Disconnected</span>
          </>
        )}
      </div>

      {/* Manual reconnect button — shown only after max retries exhausted */}
      {status === 'disconnected' && maxRetriesReached && onReconnect && (
        <button
          type="button"
          onClick={onReconnect}
          className="ml-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}
