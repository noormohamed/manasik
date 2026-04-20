/**
 * BrokerMessagesPage Component Tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrokerMessagesPage from "../BrokerMessagesPage";
import * as apiClient from "@/lib/api";

// Mock the API client
jest.mock("@/lib/api");

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock child components
jest.mock("../ConversationThread", () => {
  return function MockConversationThread() {
    return <div data-testid="conversation-thread">Conversation Thread</div>;
  };
});

describe("BrokerMessagesPage", () => {
  const mockConversations = [
    {
      id: "conv-1",
      hotelId: "hotel-1",
      bookingId: "booking-1",
      subject: "Booking Confirmation",
      description: "Confirming booking details",
      status: "ACTIVE",
      createdById: "guest-1",
      createdByRole: "GUEST",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 2,
      lastMessage: {
        content: "Thank you for booking",
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: "conv-2",
      hotelId: "hotel-1",
      bookingId: "booking-1",
      subject: "Special Offer",
      description: "Hotel sent upgrade offer",
      status: "ACTIVE",
      createdById: "staff-1",
      createdByRole: "HOTEL_STAFF",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
      lastMessage: {
        content: "We have a special offer for you",
        createdAt: new Date().toISOString(),
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
    (apiClient.apiClient.get as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BrokerMessagesPage />);

    expect(screen.getByText("Loading your messages...")).toBeInTheDocument();
  });

  it("should load and display conversations", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.getByText("Special Offer")).toBeInTheDocument();
    });
  });

  it("should display role badges for conversations", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Customer")).toBeInTheDocument();
      expect(screen.getByText("Hotel")).toBeInTheDocument();
    });
  });

  it("should filter conversations by type", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    // Click on "Customers" filter
    const customerFilter = screen.getByText("Customers");
    fireEvent.click(customerFilter);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Special Offer")).not.toBeInTheDocument();
    });
  });

  it("should filter conversations by hotel", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Special Offer")).toBeInTheDocument();
    });

    // Click on "Hotels" filter
    const hotelFilter = screen.getByText("Hotels");
    fireEvent.click(hotelFilter);

    await waitFor(() => {
      expect(screen.queryByText("Booking Confirmation")).not.toBeInTheDocument();
      expect(screen.getByText("Special Offer")).toBeInTheDocument();
    });
  });

  it("should search conversations", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search conversations...");
    fireEvent.change(searchInput, { target: { value: "Offer" } });

    await waitFor(() => {
      expect(screen.getByText("Special Offer")).toBeInTheDocument();
      expect(screen.queryByText("Booking Confirmation")).not.toBeInTheDocument();
    });
  });

  it("should display unread count badge", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("should display empty state when no conversations", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    });
  });

  it("should display error message on fetch failure", async () => {
    (apiClient.apiClient.get as jest.Mock).mockRejectedValue({
      error: "Failed to load conversations",
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load conversations")).toBeInTheDocument();
    });
  });

  it("should select conversation on click", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Booking Confirmation").closest(".conversation-item");
    fireEvent.click(conversationItem!);

    await waitFor(() => {
      expect(screen.getByTestId("conversation-thread")).toBeInTheDocument();
    });
  });

  it("should display conversation info bar when selected", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Booking Confirmation").closest(".conversation-item");
    fireEvent.click(conversationItem!);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.getByText("Booking: booking-1")).toBeInTheDocument();
    });
  });

  it("should calculate total unread count", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      // Total unread should be 2 (from first conversation)
      const totalBadge = screen.getByText("2");
      expect(totalBadge).toBeInTheDocument();
    });
  });

  it("should reset filter to all", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    // Click on "Customers" filter
    const customerFilter = screen.getByText("Customers");
    fireEvent.click(customerFilter);

    await waitFor(() => {
      expect(screen.queryByText("Special Offer")).not.toBeInTheDocument();
    });

    // Click on "All" filter
    const allFilter = screen.getByText("All");
    fireEvent.click(allFilter);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.getByText("Special Offer")).toBeInTheDocument();
    });
  });

  it("should format dates correctly", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const conversationsWithOldMessage = [
      {
        ...mockConversations[0],
        lastMessage: {
          ...mockConversations[0].lastMessage,
          createdAt: oneHourAgo.toISOString(),
        },
      },
    ];

    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: conversationsWithOldMessage,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  it("should display booking ID in conversation info", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<BrokerMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Booking Confirmation").closest(".conversation-item");
    fireEvent.click(conversationItem!);

    await waitFor(() => {
      expect(screen.getByText("Booking: booking-1")).toBeInTheDocument();
    });
  });
});
