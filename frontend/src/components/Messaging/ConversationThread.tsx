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
  senderName?: string;
  senderHotelName?: string;
  content: string;
  contentSanitized: string;
  messageType: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  total: number;
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
  booking?: Booking;
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
  const [conversationData, setConversationData] = useState<Conversation>(conversation);
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
        success?: boolean;
        data?: {
          conversation?: Conversation;
          messages?: Message[];
          pagination?: any;
        };
      };
      console.log('[ConversationThread] API Response:', response);
      
      // Update conversation data with booking info
      if (response.data?.conversation) {
        setConversationData(response.data.conversation);
      }
      
      const fetchedMessages = response.data?.messages || [];
      console.log('[ConversationThread] Fetched messages:', fetchedMessages);
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
        `/messages/conversations/${conversationData.id}/messages`,
        { content }
      )) as {
        success?: boolean;
        data?: Message;
      };

      console.log('[ConversationThread] Send message response:', response);
      const message = response.data;

      if (message && message.id) {
        console.log('[ConversationThread] Adding message to thread:', message);
        setMessages([...messages, message]);
        onNewMessage(conversationData.id);
      } else {
        console.warn('[ConversationThread] No message data in response:', response);
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

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  const getSenderName = (message: Message): string => {
    if (message.senderName) {
      // If it's a hotel staff member, show "Name (on behalf of Hotel)"
      if (message.senderRole === "HOTEL_STAFF" && message.senderHotelName) {
        return `${message.senderName} (on behalf of ${message.senderHotelName})`;
      }
      return message.senderName;
    }
    // Fallback - should rarely happen as backend provides the name
    return `User ${message.senderId.substring(0, 8)}`;
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
  // Disabled for now - show messages only
  const showSplitView = false;

  return (
    <div className={`conversation-thread ${showSplitView ? "split-view" : ""}`}>
      {/* Header */}
      <div className="conversation-header">
        <div className="conversation-header-content">
          <h3>{conversationData.subject}</h3>
          <p className="text-muted mb-0">{conversationData.description}</p>
          
          {/* Booking Info */}
          {conversationData.bookingId && conversationData.booking && (
            <div className="booking-info mt-3">
              <div className="booking-details">
                <div className="booking-detail-item">
                  <span className="label">Check-in:</span>
                  <span className="value">{formatBookingDate(conversationData.booking.checkIn)}</span>
                </div>
                <div className="booking-detail-item">
                  <span className="label">Check-out:</span>
                  <span className="value">{formatBookingDate(conversationData.booking.checkOut)}</span>
                </div>
                <div className="booking-detail-item">
                  <span className="label">Guests:</span>
                  <span className="value">{conversationData.booking.guests}</span>
                </div>
                <div className="booking-detail-item">
                  <span className="label">Status:</span>
                  <span className={`badge badge-${conversationData.booking.status.toLowerCase()}`}>
                    {conversationData.booking.status}
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-primary mt-3"
                onClick={() => window.location.href = `/dashboard/bookings?bookingId=${conversationData.bookingId}`}
              >
                <i className="ri-eye-line"></i> View Booking
              </button>
            </div>
          )}
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
              bookingId={conversationData.bookingId}
              hotelId={conversationData.hotelId}
            />
          </div>
        )}

        {/* Right Side - Messages (60% or 100%) */}
        <div className="conversation-messages-panel">
          {/* Context Info Bar */}
          {conversationData.booking && (
            <div className="conversation-context-bar">
              <div className="context-info">
                <div className="context-section">
                  <span className="context-label">Hotel:</span>
                  <span className="context-value">{conversationData.hotelId}</span>
                </div>
                <div className="context-divider">•</div>
                <div className="context-section">
                  <span className="context-label">Check-in:</span>
                  <span className="context-value">{formatBookingDate(conversationData.booking.checkIn)}</span>
                </div>
                <div className="context-divider">•</div>
                <div className="context-section">
                  <span className="context-label">Check-out:</span>
                  <span className="context-value">{formatBookingDate(conversationData.booking.checkOut)}</span>
                </div>
                <div className="context-divider">•</div>
                <div className="context-section">
                  <span className="context-label">Guests:</span>
                  <span className="context-value">{conversationData.booking.guests}</span>
                </div>
              </div>
            </div>
          )}

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
                          <div className="message-sender-info">
                            <strong className="message-sender-name">{getSenderName(message)}</strong>
                            <span className={`badge ${getRoleColor(message.senderRole)}`}>
                              {getRoleLabel(message.senderRole)}
                            </span>
                          </div>
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
            disabled={sending || conversationData.status !== "ACTIVE"}
            placeholder={
              conversationData.status !== "ACTIVE"
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
