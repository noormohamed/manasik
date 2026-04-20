"use client";

import React, { useMemo } from "react";
import "./MessagingAnalytics.css";

interface Conversation {
  id: string;
  hotelId: string;
  hotelName?: string;
  bookingId?: string;
  subject: string;
  status: "ACTIVE" | "ARCHIVED" | "CLOSED";
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  isEscalated?: boolean;
}

interface MessagingAnalyticsProps {
  conversations: Conversation[];
}

const MessagingAnalytics: React.FC<MessagingAnalyticsProps> = ({ conversations }) => {
  const analytics = useMemo(() => {
    const stats = {
      totalConversations: conversations.length,
      activeConversations: conversations.filter((c) => c.status === "ACTIVE").length,
      archivedConversations: conversations.filter((c) => c.status === "ARCHIVED").length,
      closedConversations: conversations.filter((c) => c.status === "CLOSED").length,
      totalUnread: conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
      escalatedConversations: conversations.filter((c) => c.isEscalated).length,
      guestConversations: conversations.filter((c) => c.createdByRole === "GUEST").length,
      brokerConversations: conversations.filter((c) => c.createdByRole === "BROKER").length,
      staffConversations: conversations.filter((c) => c.createdByRole === "HOTEL_STAFF").length,
    };

    // Calculate hotel statistics
    const hotelStats: Record<string, number> = {};
    conversations.forEach((conv) => {
      const hotelName = conv.hotelName || "Unknown Hotel";
      hotelStats[hotelName] = (hotelStats[hotelName] || 0) + 1;
    });

    const topHotels = Object.entries(hotelStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Calculate role distribution
    const roleDistribution = [
      { role: "Guest", count: stats.guestConversations, percentage: Math.round((stats.guestConversations / stats.totalConversations) * 100) || 0 },
      { role: "Broker", count: stats.brokerConversations, percentage: Math.round((stats.brokerConversations / stats.totalConversations) * 100) || 0 },
      { role: "Staff", count: stats.staffConversations, percentage: Math.round((stats.staffConversations / stats.totalConversations) * 100) || 0 },
    ];

    // Calculate status distribution
    const statusDistribution = [
      { status: "Active", count: stats.activeConversations, percentage: Math.round((stats.activeConversations / stats.totalConversations) * 100) || 0 },
      { status: "Archived", count: stats.archivedConversations, percentage: Math.round((stats.archivedConversations / stats.totalConversations) * 100) || 0 },
      { status: "Closed", count: stats.closedConversations, percentage: Math.round((stats.closedConversations / stats.totalConversations) * 100) || 0 },
    ];

    return {
      stats,
      topHotels,
      roleDistribution,
      statusDistribution,
    };
  }, [conversations]);

  return (
    <div className="messaging-analytics">
      <div className="analytics-header">
        <h2>Messaging Analytics</h2>
        <p className="text-muted">Platform-wide messaging statistics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="ri-mail-line"></i>
          </div>
          <div className="metric-content">
            <h6>Total Conversations</h6>
            <p className="metric-value">{analytics.stats.totalConversations}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon active">
            <i className="ri-check-line"></i>
          </div>
          <div className="metric-content">
            <h6>Active</h6>
            <p className="metric-value">{analytics.stats.activeConversations}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon unread">
            <i className="ri-notification-line"></i>
          </div>
          <div className="metric-content">
            <h6>Unread Messages</h6>
            <p className="metric-value">{analytics.stats.totalUnread}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon escalated">
            <i className="ri-alert-line"></i>
          </div>
          <div className="metric-content">
            <h6>Escalated</h6>
            <p className="metric-value">{analytics.stats.escalatedConversations}</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Role Distribution */}
        <div className="analytics-section">
          <h3>Conversations by Role</h3>
          <div className="distribution-list">
            {analytics.roleDistribution.map((item) => (
              <div key={item.role} className="distribution-item">
                <div className="distribution-info">
                  <span className="distribution-label">{item.role}</span>
                  <span className="distribution-count">{item.count}</span>
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="distribution-percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="analytics-section">
          <h3>Conversations by Status</h3>
          <div className="distribution-list">
            {analytics.statusDistribution.map((item) => (
              <div key={item.status} className="distribution-item">
                <div className="distribution-info">
                  <span className="distribution-label">{item.status}</span>
                  <span className="distribution-count">{item.count}</span>
                </div>
                <div className="distribution-bar">
                  <div
                    className={`distribution-fill status-${item.status.toLowerCase()}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="distribution-percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Hotels */}
      {analytics.topHotels.length > 0 && (
        <div className="analytics-section">
          <h3>Top Hotels by Conversations</h3>
          <div className="hotels-list">
            {analytics.topHotels.map((hotel, index) => (
              <div key={hotel.name} className="hotel-item">
                <div className="hotel-rank">#{index + 1}</div>
                <div className="hotel-info">
                  <h6>{hotel.name}</h6>
                  <p className="text-muted">{hotel.count} conversations</p>
                </div>
                <div className="hotel-count">{hotel.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="analytics-summary">
        <div className="summary-card">
          <h6>Closed Conversations</h6>
          <p className="summary-value">{analytics.stats.closedConversations}</p>
        </div>
        <div className="summary-card">
          <h6>Archived Conversations</h6>
          <p className="summary-value">{analytics.stats.archivedConversations}</p>
        </div>
        <div className="summary-card">
          <h6>Average Conversations per Hotel</h6>
          <p className="summary-value">
            {analytics.topHotels.length > 0
              ? Math.round(
                  analytics.topHotels.reduce((sum, h) => sum + h.count, 0) /
                    analytics.topHotels.length
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagingAnalytics;
