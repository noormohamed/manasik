"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import ConversationList from "./ConversationList";
import ConversationThread from "./ConversationThread";
import "./MessagesPage.css";

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

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Filter conversations based on search term
    if (searchTerm.trim().length === 0) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

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
    // Refresh conversations to get updated unread counts
    fetchConversations();
  };

  const handleNewMessage = (conversationId: string) => {
    // Refresh conversations after new message
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

  if (loading && conversations.length === 0) {
    return (
      <div className="messages-page">
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
    <div className="messages-page">
      <div className="messages-container">
        {/* Sidebar - Conversation List */}
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Messages</h2>
            {totalUnread > 0 && (
              <span className="badge bg-danger">{totalUnread}</span>
            )}
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

          <div className="messages-actions">
            <Link href="/dashboard/messages/new" className="btn btn-primary btn-sm w-100">
              <i className="ri-add-line me-2"></i>
              New Message
            </Link>
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
              {!searchTerm && (
                <Link href="/dashboard/messages/new" className="btn btn-outline-primary btn-sm">
                  Start a conversation
                </Link>
              )}
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
                    <h5 className="conversation-subject">{conversation.subject}</h5>
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
            <ConversationThread
              conversation={selectedConversation}
              onClose={handleConversationClose}
              onNewMessage={handleNewMessage}
            />
          ) : (
            <div className="messages-empty-state">
              <i className="ri-mail-open-line"></i>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to view messages</p>
              <Link href="/dashboard/messages/new" className="btn btn-primary">
                <i className="ri-add-line me-2"></i>
                Start New Conversation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
