"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import ConversationThread from "./ConversationThread";
import "./BrokerMessagesPage.css";

interface Conversation {
  id: string;
  hotelId: string;
  bookingId?: string;
  subject: string;
  description?: string;
  status: "ACTIVE" | "ARCHIVED" | "CLOSED";
  createdById: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  participants?: any[];
  lastMessage?: any;
  unreadCount?: number;
}

interface Booking {
  id: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  status: string;
}

const BrokerMessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "hotel" | "customer">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Filter conversations based on search term and filter type
    let filtered = conversations;

    if (filterType === "hotel") {
      filtered = filtered.filter((conv) => conv.createdByRole === "HOTEL_STAFF");
    } else if (filterType === "customer") {
      filtered = filtered.filter((conv) => conv.createdByRole === "GUEST");
    }

    if (searchTerm.trim().length > 0) {
      filtered = filtered.filter(
        (conv) =>
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  }, [searchTerm, conversations, filterType]);

  useEffect(() => {
    // Calculate total unread count
    const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setTotalUnread(total);
  }, [conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.get("/messages/conversations")) as {
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "GUEST":
        return "Customer";
      case "HOTEL_STAFF":
        return "Hotel";
      default:
        return role.replace(/_/g, " ");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "GUEST":
        return "badge-info";
      case "HOTEL_STAFF":
        return "badge-success";
      default:
        return "badge-secondary";
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="broker-messages-page">
        <div className="messages-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="broker-messages-page">
      <div className="messages-container">
        {/* Sidebar - Conversation List */}
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Booking Messages</h2>
            {totalUnread > 0 && (
              <span className="badge bg-danger">{totalUnread}</span>
            )}
          </div>

          <div className="broker-filters">
            <div className="filter-buttons">
              <button
                className={`btn btn-sm ${filterType === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${filterType === "hotel" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilterType("hotel")}
              >
                <i className="ri-building-line me-1"></i>
                Hotels
              </button>
              <button
                className={`btn btn-sm ${filterType === "customer" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilterType("customer")}
              >
                <i className="ri-user-line me-1"></i>
                Customers
              </button>
            </div>
          </div>

          <div className="messages-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search conversations..."
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
                {searchTerm ? "No conversations match your search" : "No conversations yet"}
              </p>
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    selectedConversation?.id === conversation.id ? "active" : ""
                  } ${(conversation.unreadCount || 0) > 0 ? "unread" : ""}`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="conversation-item-header">
                    <div className="conversation-subject-group">
                      <h5 className="conversation-subject">{conversation.subject}</h5>
                      <span className={`badge ${getRoleBadgeClass(conversation.createdByRole)}`}>
                        {getRoleLabel(conversation.createdByRole)}
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
                  <small className="conversation-date">
                    {formatDate(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                  </small>
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
                    <span className={`badge ${getRoleBadgeClass(selectedConversation.createdByRole)}`}>
                      {getRoleLabel(selectedConversation.createdByRole)}
                    </span>
                    {selectedConversation.bookingId && (
                      <span className="ms-2">
                        <i className="ri-calendar-line me-1"></i>
                        Booking: {selectedConversation.bookingId}
                      </span>
                    )}
                  </p>
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
    </div>
  );
};

export default BrokerMessagesPage;
