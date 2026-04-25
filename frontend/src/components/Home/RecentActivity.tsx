"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import "./RecentActivity.css";

interface Booking {
  id: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  total: number;
}

interface Message {
  id: string;
  subject: string;
  unreadCount: number;
  bookingId?: string;
  bookingStatus?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  updatedAt?: string;
}

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentBookings();
      fetchRecentMessages();
    }
  }, [user]);

  const fetchRecentBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = (await apiClient.get("/bookings?limit=5&offset=0")) as {
        data?: Booking[];
      };
      const allBookings = response.data || [];
      // Filter for confirmed bookings (not completed or cancelled)
      const confirmedBookings = allBookings.filter(
        (b: Booking) => b.status === "CONFIRMED"
      );
      setBookings(confirmedBookings.slice(0, 5));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = (await apiClient.get("/messages/conversations?limit=5&offset=0")) as {
        data?: Message[];
      };
      setMessages(response.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isMessageValid = (message: Message): boolean => {
    // Hide messages related to completed bookings
    if (message.bookingStatus === "COMPLETED" || message.bookingStatus === "CANCELLED") {
      return false;
    }

    // Hide hotel messages inactive for 30+ days
    if (!message.bookingId && message.updatedAt) {
      const lastUpdate = new Date(message.updatedAt);
      const now = new Date();
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate >= 30) {
        return false;
      }
    }

    return true;
  };

  const getValidMessages = (): Message[] => {
    return messages.filter(isMessageValid);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="recent-activity-section">
      <div className="container">
        {/* Recent Bookings Row - Only show if there are bookings */}
        {!loadingBookings && bookings.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="activity-card">
                <div className="activity-header">
                  <span className="top-title">BOOKINGS</span>
                  <Link href="/me/bookings" className="view-all-link">
                    View All
                  </Link>
                </div>

                <div className="activity-list">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="activity-item">
                      <div className="activity-item-content">
                        <h5>{booking.hotelName}</h5>
                        <p className="activity-date">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </p>
                      </div>
                      <div className="activity-item-price">
                        ${booking.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Row - Only show if there are valid messages */}
        {!loadingMessages && getValidMessages().length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="activity-card">
                <div className="activity-header">
                  <span className="top-title">MESSAGES</span>
                  <Link href="/dashboard/messages" className="view-all-link">
                    View All
                  </Link>
                </div>

                <div className="activity-list">
                  {getValidMessages().map((message) => (
                    <Link
                      key={message.id}
                      href={`/dashboard/messages?conversationId=${message.id}`}
                      className="activity-item message-item"
                    >
                      <div className="activity-item-content">
                        <div className="message-subject-wrapper">
                          <h5>{message.subject}</h5>
                          {message.unreadCount > 0 && (
                            <span className="unread-badge">
                              {message.unreadCount}
                            </span>
                          )}
                        </div>
                        {message.lastMessage && (
                          <p className="activity-preview">
                            {message.lastMessage.content.substring(0, 50)}
                            {message.lastMessage.content.length > 50 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
