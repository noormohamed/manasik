"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import MessageComposer from "./MessageComposer";
import ConversationContext from "./ConversationContext";
import "./ConversationThread.css";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  contentSanitized: string;
  messageType: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

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

interface ConversationThreadProps {
  conversation: Conversation;
  onClose: () => void;
  onNewMessage: (conversationId: string) => void;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({
  conversation,
  onClose,
  onNewMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.get(
        `/messages/conversations/${conversation.id}?limit=50&offset=0`
      )) as {
        data?: { messages?: Message[] };
      };
      const fetchedMessages = response.data?.messages || [];
      setMessages(fetchedMessages.reverse()); // Reverse to show oldest first
      setError(null);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.error || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      setSending(true);
      const response = (await apiClient.post(
        `/messages/conversations/${conversation.id}/messages`,
        { content }
      )) as { data?: Message };

      if (response.data) {
        setMessages([...messages, response.data]);
        onNewMessage(conversation.id);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await apiClient.put(`/messages/${messageId}/read`);
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "GUEST":
        return "badge-info";
      case "BROKER":
        return "badge-warning";
      case "HOTEL_STAFF":
        return "badge-success";
      case "MANAGER":
        return "badge-primary";
      case "ADMIN":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    return role.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="conversation-thread">
        <div className="conversation-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // Determine if we should show split view (when there's a booking or hotel context)
  const showSplitView = conversation.bookingId || conversation.hotelId;

  return (
    <div className={`conversation-thread ${showSplitView ? "split-view" : ""}`}>
      {/* Header */}
      <div className="conversation-header">
        <div className="conversation-header-content">
          <h3>{conversation.subject}</h3>
          <p className="text-muted mb-0">{conversation.description}</p>
        </div>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={onClose}
          title="Close conversation"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="conversation-main">
        {/* Left Side - Context (40%) - Only shown on desktop when split view is enabled */}
        {showSplitView && (
          <div className="conversation-context-panel">
            <ConversationContext
              bookingId={conversation.bookingId}
              hotelId={conversation.hotelId}
            />
          </div>
        )}

        {/* Right Side - Messages (60% or 100%) */}
        <div className="conversation-messages-panel">
          {/* Messages */}
          <div className="conversation-messages">
            {error && (
              <div className="alert alert-danger alert-sm" role="alert">
                {error}
              </div>
            )}

            {messages.length === 0 ? (
              <div className="messages-empty">
                <i className="ri-mail-open-line"></i>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message, index) => {
                  const showDate =
                    index === 0 ||
                    formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="message-date-separator">
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      )}
                      <div className={`message ${message.messageType.toLowerCase()}`}>
                        <div className="message-header">
                          <span className={`badge ${getRoleColor(message.senderRole)}`}>
                            {getRoleLabel(message.senderRole)}
                          </span>
                          <small className="text-muted">{formatTime(message.createdAt)}</small>
                        </div>
                        <div className="message-content">
                          {message.messageType === "SYSTEM" ? (
                            <em className="text-muted">{message.contentSanitized}</em>
                          ) : (
                            <p>{message.contentSanitized}</p>
                          )}
                        </div>
                        {message.messageType === "UPGRADE_OFFER" && message.metadata?.offer && (
                          <div className="message-offer">
                            <div className="offer-details">
                              <h6>{message.metadata.offer.title}</h6>
                              <p>{message.metadata.offer.description}</p>
                              {message.metadata.offer.price && (
                                <p className="offer-price">
                                  <strong>${message.metadata.offer.price}</strong>
                                </p>
                              )}
                            </div>
                            <button className="btn btn-sm btn-primary">
                              View Offer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Composer */}
          <MessageComposer
            onSendMessage={handleSendMessage}
            disabled={sending || conversation.status !== "ACTIVE"}
            placeholder={
              conversation.status !== "ACTIVE"
                ? "This conversation is closed"
                : "Type your message..."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationThread;
