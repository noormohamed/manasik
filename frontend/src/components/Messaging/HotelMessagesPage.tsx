"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import ConversationThread from "./ConversationThread";
import ConversationAssignment from "./ConversationAssignment";
import "./HotelMessagesPage.css";

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
  assignedToId?: string;
  assignedToName?: string;
}

interface HotelStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const HotelMessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "ARCHIVED" | "CLOSED">("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [hotelStaff, setHotelStaff] = useState<HotelStaff[]>([]);

  useEffect(() => {
    fetchConversations();
    fetchHotelStaff();
  }, []);

  useEffect(() => {
    // Filter conversations based on search term and status
    let filtered = conversations;

    if (statusFilter !== "all") {
      filtered = filtered.filter((conv) => conv.status === statusFilter);
    }

    if (searchTerm.trim().length > 0) {
      filtered = filtered.filter(
        (conv) =>
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  }, [searchTerm, conversations, statusFilter]);

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

  const fetchHotelStaff = async () => {
    try {
      const response = (await apiClient.get("/hotel/staff")) as {
        data?: HotelStaff[];
      };
      setHotelStaff(response.data || []);
    } catch (err: any) {
      console.error("Error fetching hotel staff:", err);
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

  const handleAssignConversation = async (staffId: string) => {
    if (!selectedConversation) return;

    try {
      await apiClient.post(
        `/messages/conversations/${selectedConversation.id}/assign`,
        { assignedToId: staffId }
      );
      
      // Update the selected conversation
      setSelectedConversation({
        ...selectedConversation,
        assignedToId: staffId,
        assignedToName: hotelStaff.find((s) => s.id === staffId)?.firstName,
      });

      // Refresh conversations
      fetchConversations();
      setShowAssignmentModal(false);
    } catch (err: any) {
      console.error("Error assigning conversation:", err);
      setError(err.error || "Failed to assign conversation");
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "ARCHIVED" | "CLOSED") => {
    if (!selectedConversation) return;

    try {
      await apiClient.put(
        `/messages/conversations/${selectedConversation.id}/status`,
        { status: newStatus }
      );

      // Update the selected conversation
      setSelectedConversation({
        ...selectedConversation,
        status: newStatus,
      });

      // Refresh conversations
      fetchConversations();
    } catch (err: any) {
      console.error("Error updating conversation status:", err);
      setError(err.error || "Failed to update conversation status");
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
      <div className="hotel-messages-page">
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
    <div className="hotel-messages-page">
      <div className="messages-container">
        {/* Sidebar - Conversation List */}
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Conversations</h2>
            {totalUnread > 0 && (
              <span className="badge bg-danger">{totalUnread}</span>
            )}
          </div>

          <div className="hotel-filters">
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
                <i className="ri-check-line me-1"></i>
                Active
              </button>
              <button
                className={`btn btn-sm ${statusFilter === "ARCHIVED" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStatusFilter("ARCHIVED")}
              >
                <i className="ri-archive-line me-1"></i>
                Archived
              </button>
              <button
                className={`btn btn-sm ${statusFilter === "CLOSED" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStatusFilter("CLOSED")}
              >
                <i className="ri-close-line me-1"></i>
                Closed
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
                    {conversation.assignedToName && (
                      <small className="conversation-assigned">
                        <i className="ri-user-line me-1"></i>
                        {conversation.assignedToName}
                      </small>
                    )}
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
                    {selectedConversation.bookingId && (
                      <span className="ms-2">
                        <i className="ri-calendar-line me-1"></i>
                        Booking: {selectedConversation.bookingId}
                      </span>
                    )}
                  </p>
                </div>
                <div className="conversation-actions">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowAssignmentModal(true)}
                    title="Assign to staff"
                  >
                    <i className="ri-user-add-line me-1"></i>
                    Assign
                  </button>
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ri-more-2-line"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      {selectedConversation.status !== "ARCHIVED" && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange("ARCHIVED")}
                          >
                            <i className="ri-archive-line me-2"></i>
                            Archive
                          </button>
                        </li>
                      )}
                      {selectedConversation.status !== "CLOSED" && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange("CLOSED")}
                          >
                            <i className="ri-close-line me-2"></i>
                            Close
                          </button>
                        </li>
                      )}
                      {selectedConversation.status !== "ACTIVE" && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange("ACTIVE")}
                          >
                            <i className="ri-check-line me-2"></i>
                            Reopen
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
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

      {/* Assignment Modal */}
      {showAssignmentModal && selectedConversation && (
        <ConversationAssignment
          conversation={selectedConversation}
          staff={hotelStaff}
          onAssign={handleAssignConversation}
          onClose={() => setShowAssignmentModal(false)}
        />
      )}
    </div>
  );
};

export default HotelMessagesPage;
