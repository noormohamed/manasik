"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import ConversationThread from "./ConversationThread";
import MessagingAnalytics from "./MessagingAnalytics";
import "./AdminMessagesPage.css";

interface Conversation {
  id: string;
  hotelId: string;
  hotelName?: string;
  bookingId?: string;
  subject: string;
  description?: string;
  status: "ACTIVE" | "ARCHIVED" | "CLOSED";
  createdById: string;
  createdByRole: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  participants?: any[];
  lastMessage?: any;
  unreadCount?: number;
  isEscalated?: boolean;
}

const AdminMessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"conversations" | "analytics">("conversations");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "ARCHIVED" | "CLOSED">("ACTIVE");
  const [roleFilter, setRoleFilter] = useState<"all" | "GUEST" | "BROKER" | "HOTEL_STAFF">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [escalatedOnly, setEscalatedOnly] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Filter conversations based on all criteria
    let filtered = conversations;

    if (statusFilter !== "all") {
      filtered = filtered.filter((conv) => conv.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((conv) => conv.createdByRole === roleFilter);
    }

    if (escalatedOnly) {
      filtered = filtered.filter((conv) => conv.isEscalated);
    }

    if (searchTerm.trim().length > 0) {
      filtered = filtered.filter(
        (conv) =>
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.createdByName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  }, [searchTerm, conversations, statusFilter, roleFilter, escalatedOnly]);

  useEffect(() => {
    // Calculate total unread count
    const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setTotalUnread(total);
  }, [conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.get("/admin/messages/conversations")) as {
        data?: Conversation[];
      };
      setConversations(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching conversations:", err);
      setError(err.error || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationClose = () => {
    setSelectedConversation(null);
    fetchConversations();
  };

  const handleNewMessage = (conversationId: string) => {
    fetchConversations();
  };

  const handleEscalate = async (conversationId: string) => {
    try {
      await apiClient.post(`/admin/messages/conversations/${conversationId}/escalate`);
      fetchConversations();
    } catch (err: any) {
      console.error("Error escalating conversation:", err);
      setError(err.error || "Failed to escalate conversation");
    }
  };

  const handleResolveEscalation = async (conversationId: string) => {
    try {
      await apiClient.post(`/admin/messages/conversations/${conversationId}/resolve-escalation`);
      fetchConversations();
    } catch (err: any) {
      console.error("Error resolving escalation:", err);
      setError(err.error || "Failed to resolve escalation");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "badge-success";
      case "ARCHIVED":
        return "badge-warning";
      case "CLOSED":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "GUEST":
        return "Guest";
      case "BROKER":
        return "Broker";
      case "HOTEL_STAFF":
        return "Staff";
      default:
        return role.replace(/_/g, " ");
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="admin-messages-page">
        <div className="messages-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-messages-page">
      {/* View Mode Tabs */}
      <div className="admin-view-tabs">
        <button
          className={`tab-button ${viewMode === "conversations" ? "active" : ""}`}
          onClick={() => setViewMode("conversations")}
        >
          <i className="ri-mail-line me-2"></i>
          Conversations
          {totalUnread > 0 && <span className="badge bg-danger ms-2">{totalUnread}</span>}
        </button>
        <button
          className={`tab-button ${viewMode === "analytics" ? "active" : ""}`}
          onClick={() => setViewMode("analytics")}
        >
          <i className="ri-bar-chart-line me-2"></i>
          Analytics
        </button>
      </div>

      {viewMode === "conversations" ? (
        <div className="messages-container">
          {/* Sidebar - Conversation List */}
          <div className="messages-sidebar">
            <div className="messages-header">
              <h2>All Conversations</h2>
              {totalUnread > 0 && (
                <span className="badge bg-danger">{totalUnread}</span>
              )}
            </div>

            <div className="admin-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <div className="filter-buttons">
                    <button
                      className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`btn btn-sm ${statusFilter === "ACTIVE" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("ACTIVE")}
                    >
                      Active
                    </button>
                    <button
                      className={`btn btn-sm ${statusFilter === "ARCHIVED" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("ARCHIVED")}
                    >
                      Archived
                    </button>
                    <button
                      className={`btn btn-sm ${statusFilter === "CLOSED" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("CLOSED")}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Role</label>
                  <div className="filter-buttons">
                    <button
                      className={`btn btn-sm ${roleFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setRoleFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`btn btn-sm ${roleFilter === "GUEST" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setRoleFilter("GUEST")}
                    >
                      Guests
                    </button>
                    <button
                      className={`btn btn-sm ${roleFilter === "BROKER" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setRoleFilter("BROKER")}
                    >
                      Brokers
                    </button>
                    <button
                      className={`btn btn-sm ${roleFilter === "HOTEL_STAFF" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setRoleFilter("HOTEL_STAFF")}
                    >
                      Staff
                    </button>
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={escalatedOnly}
                      onChange={(e) => setEscalatedOnly(e.target.checked)}
                    />
                    <span className="ms-2">Escalated Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="messages-search">
              <input
                type="text"
                className="form-control"
                placeholder="Search conversations, hotels, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {error && (
              <div className="alert alert-danger alert-sm" role="alert">
                {error}
              </div>
            )}

            {filteredConversations.length === 0 ? (
              <div className="messages-empty">
                <i className="ri-mail-line"></i>
                <p>
                  {searchTerm ? "No conversations match your search" : "No conversations found"}
                </p>
              </div>
            ) : (
              <div className="conversations-list">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      selectedConversation?.id === conversation.id ? "active" : ""
                    } ${(conversation.unreadCount || 0) > 0 ? "unread" : ""} ${
                      conversation.isEscalated ? "escalated" : ""
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="conversation-item-header">
                      <div className="conversation-subject-group">
                        <h5 className="conversation-subject">{conversation.subject}</h5>
                        {conversation.isEscalated && (
                          <span className="badge badge-danger">
                            <i className="ri-alert-line me-1"></i>
                            Escalated
                          </span>
                        )}
                        <span className={`badge ${getStatusBadgeClass(conversation.status)}`}>
                          {conversation.status}
                        </span>
                      </div>
                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="badge bg-primary">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="conversation-preview">
                      {conversation.lastMessage?.content?.substring(0, 50) ||
                        conversation.description?.substring(0, 50) ||
                        "No messages yet"}
                      {(conversation.lastMessage?.content?.length || 0) > 50 ? "..." : ""}
                    </p>
                    <div className="conversation-meta">
                      <small className="conversation-date">
                        {formatDate(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                      </small>
                      <small className="conversation-hotel">
                        <i className="ri-building-line me-1"></i>
                        {conversation.hotelName || "Hotel"}
                      </small>
                      <small className="conversation-role">
                        <i className="ri-user-line me-1"></i>
                        {getRoleLabel(conversation.createdByRole)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content - Conversation Thread */}
          <div className="messages-content">
            {selectedConversation ? (
              <div className="conversation-wrapper">
                <div className="conversation-info-bar">
                  <div className="conversation-info">
                    <h4>{selectedConversation.subject}</h4>
                    <p className="text-muted mb-0">
                      <span className={`badge ${getStatusBadgeClass(selectedConversation.status)}`}>
                        {selectedConversation.status}
                      </span>
                      {selectedConversation.hotelName && (
                        <span className="ms-2">
                          <i className="ri-building-line me-1"></i>
                          {selectedConversation.hotelName}
                        </span>
                      )}
                      {selectedConversation.createdByName && (
                        <span className="ms-2">
                          <i className="ri-user-line me-1"></i>
                          {selectedConversation.createdByName}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="conversation-actions">
                    {selectedConversation.isEscalated ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleResolveEscalation(selectedConversation.id)}
                        title="Resolve escalation"
                      >
                        <i className="ri-check-line me-1"></i>
                        Resolve
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEscalate(selectedConversation.id)}
                        title="Escalate conversation"
                      >
                        <i className="ri-alert-line me-1"></i>
                        Escalate
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleConversationClose}
                      title="Close"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>
                <ConversationThread
                  conversation={selectedConversation}
                  onClose={handleConversationClose}
                  onNewMessage={handleNewMessage}
                />
              </div>
            ) : (
              <div className="messages-empty-state">
                <i className="ri-mail-open-line"></i>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to view messages</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <MessagingAnalytics conversations={conversations} />
      )}
    </div>
  );
};

export default AdminMessagesPage;
