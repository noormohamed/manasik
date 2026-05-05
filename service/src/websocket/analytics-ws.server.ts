import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { URL } from 'url';
import { adminAuthService, AdminJWTPayload } from '../services/admin-auth.service';
import { AnalyticsEventEmitter, AnalyticsEvent } from './analytics-events';

/**
 * Extended WebSocket with authentication metadata and refresh timer.
 */
export interface AuthenticatedWebSocket extends WebSocket {
  adminUserId: number;
  adminEmail: string;
  adminRole: string;
  sessionId: number;
  tokenExp: number; // JWT expiry as Unix timestamp (seconds)
  refreshTimer?: NodeJS.Timeout;
}

/**
 * WebSocket server for pushing real-time analytics events to connected admin clients.
 *
 * - Runs on the same HTTP server as Koa, at path `/ws/analytics`
 * - Authenticates via JWT token in `?token=` query parameter
 * - Broadcasts AnalyticsEventEmitter events to all connected clients
 * - Handles server-side token refresh for long-lived connections (e.g. TV displays)
 */
export class AnalyticsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<AuthenticatedWebSocket>;
  private eventEmitter: AnalyticsEventEmitter;
  private eventHandler: (event: AnalyticsEvent) => void;

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/ws/analytics' });
    this.clients = new Set();
    this.eventEmitter = AnalyticsEventEmitter.getInstance();

    // Bind the event handler so we can remove it later if needed
    this.eventHandler = (event: AnalyticsEvent) => {
      this.broadcast(event);
    };

    this.setupConnectionHandler();
    this.setupEventListener();
  }

  /**
   * Handle new WebSocket connections: authenticate and set up lifecycle.
   */
  private setupConnectionHandler(): void {
    this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      const client = ws as AuthenticatedWebSocket;

      // Extract token from query parameter
      const token = this.extractToken(req);
      if (!token) {
        client.close(4001, 'Authentication failed');
        return;
      }

      // Verify the JWT token
      const payload = adminAuthService.verifyAccessToken(token);
      if (!payload) {
        client.close(4001, 'Authentication failed');
        return;
      }

      // Store auth metadata on the socket
      client.adminUserId = payload.adminUserId;
      client.adminEmail = payload.email;
      client.adminRole = payload.role;
      client.sessionId = payload.sessionId;

      // Extract exp from the raw decoded token (jwt.verify returns the full payload including exp)
      const decoded = adminAuthService.decodeToken(token) as (AdminJWTPayload & { exp?: number }) | null;
      client.tokenExp = decoded?.exp ?? 0;

      // Add to connected clients
      this.clients.add(client);

      // Start token refresh timer
      this.startTokenRefreshTimer(client);

      // Handle disconnect
      client.on('close', () => {
        this.handleDisconnect(client);
      });

      client.on('error', (err) => {
        console.error(`WebSocket error for admin ${client.adminUserId}:`, err);
        this.handleDisconnect(client);
      });
    });
  }

  /**
   * Listen to AnalyticsEventEmitter and broadcast events to all clients.
   */
  private setupEventListener(): void {
    this.eventEmitter.on('analyticsEvent', this.eventHandler);
  }

  /**
   * Extract JWT token from the `?token=` query parameter.
   */
  private extractToken(req: http.IncomingMessage): string | null {
    try {
      // req.url is something like /ws/analytics?token=xxx
      // Use a dummy base to parse relative URLs
      const url = new URL(req.url || '', 'http://localhost');
      return url.searchParams.get('token') || null;
    } catch {
      return null;
    }
  }

  /**
   * Broadcast an analytics event as JSON to all connected clients.
   */
  broadcast(event: AnalyticsEvent): void {
    const message = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.error(`Failed to send to admin ${client.adminUserId}:`, err);
        }
      }
    }
  }

  /**
   * Schedule a token refresh 5 minutes before the current token expires.
   * When the timer fires, generate new tokens and send an `auth:tokenRefreshed` event.
   */
  private startTokenRefreshTimer(client: AuthenticatedWebSocket): void {
    // Clear any existing timer
    if (client.refreshTimer) {
      clearTimeout(client.refreshTimer);
      client.refreshTimer = undefined;
    }

    if (!client.tokenExp) {
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const refreshAtSeconds = client.tokenExp - 5 * 60; // 5 minutes before expiry
    const delayMs = (refreshAtSeconds - nowSeconds) * 1000;

    if (delayMs <= 0) {
      // Token is already within the refresh window or expired — refresh immediately
      this.refreshToken(client);
      return;
    }

    client.refreshTimer = setTimeout(() => {
      this.refreshToken(client);
    }, delayMs);
  }

  /**
   * Generate new tokens and send them to the client.
   */
  private refreshToken(client: AuthenticatedWebSocket): void {
    try {
      // Reconstruct an AdminUser-compatible object from the stored socket metadata
      const tokens = adminAuthService.generateTokens(
        {
          id: client.adminUserId,
          email: client.adminEmail,
          password_hash: '',
          full_name: '',
          role: client.adminRole,
          status: 'active',
          mfa_enabled: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        client.sessionId
      );

      // Update the client's token expiry
      const decoded = adminAuthService.decodeToken(tokens.accessToken) as (AdminJWTPayload & { exp?: number }) | null;
      if (decoded?.exp) {
        client.tokenExp = decoded.exp;
      }

      // Send the refreshed token to the client
      const refreshEvent = {
        eventType: 'auth:tokenRefreshed',
        timestamp: new Date().toISOString(),
        data: { token: tokens.accessToken },
        delta: null,
      };

      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(refreshEvent));
      }

      // Schedule the next refresh
      this.startTokenRefreshTimer(client);
    } catch (err) {
      console.error(`Token refresh failed for admin ${client.adminUserId}:`, err);
      // Don't send malformed data — client will eventually disconnect and reconnect
    }
  }

  /**
   * Clean up when a client disconnects: remove from set and clear refresh timer.
   */
  private handleDisconnect(client: AuthenticatedWebSocket): void {
    if (client.refreshTimer) {
      clearTimeout(client.refreshTimer);
      client.refreshTimer = undefined;
    }
    this.clients.delete(client);
  }

  /**
   * Gracefully shut down the WebSocket server.
   */
  close(): void {
    this.eventEmitter.off('analyticsEvent', this.eventHandler);

    for (const client of this.clients) {
      this.handleDisconnect(client);
      client.close(1000, 'Server shutting down');
    }

    this.wss.close();
  }
}
