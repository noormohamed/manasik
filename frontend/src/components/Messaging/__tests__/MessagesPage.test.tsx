/**
 * MessagesPage Component Tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MessagesPage from "../MessagesPage";
import * as apiClient from "@/lib/api";

// Mock the API client
jest.mock("@/lib/api");

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock child components
jest.mock("../ConversationList", () => {
  return function MockConversationList() {
    return <div data-testid="conversation-list">Conversation List</div>;
  };
});

jest.mock("../ConversationThread", () => {
  return function MockConversationThread() {
    return <div data-testid="conversation-thread">Conversation Thread</div>;
  };
});

describe("MessagesPage", () => {
  const mockConversations = [
    {
      id: "conv-1",
      hotelId: "hotel-1",
      subject: "Room Inquiry",
      description: "I have a question about room availability",
      status: "ACTIVE",
      createdById: "user-1",
      createdByRole: "GUEST",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 2,
      lastMessage: {
        content: "Thank you for your inquiry",
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: "conv-2",
      hotelId: "hotel-2",
      subject: "Booking Confirmation",
      description: "Confirming my booking",
      status: "ACTIVE",
      createdById: "user-1",
      createdByRole: "GUEST",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
      lastMessage: {
        content: "Your booking is confirmed",
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

    render(<MessagesPage />);

    expect(screen.getByText("Loading your messages...")).toBeInTheDocument();
  });

  it("should load and display conversations", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Inquiry")).toBeInTheDocument();
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });
  });

  it("should display unread count badge", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("should filter conversations by search term", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Inquiry")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search conversations...");
    fireEvent.change(searchInput, { target: { value: "Booking" } });

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Room Inquiry")).not.toBeInTheDocument();
    });
  });

  it("should display empty state when no conversations", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    });
  });

  it("should display error message on fetch failure", async () => {
    (apiClient.apiClient.get as jest.Mock).mockRejectedValue({
      error: "Failed to load conversations",
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load conversations")).toBeInTheDocument();
    });
  });

  it("should select conversation on click", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Inquiry")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Inquiry").closest(".conversation-item");
    fireEvent.click(conversationItem!);

    await waitFor(() => {
      expect(screen.getByTestId("conversation-thread")).toBeInTheDocument();
    });
  });

  it("should calculate total unread count", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      // Total unread should be 2 (from first conversation)
      const totalBadge = screen.getByText("2");
      expect(totalBadge).toBeInTheDocument();
    });
  });

  it("should have link to new message page", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      const newMessageLinks = screen.getAllByText(/New Message/i);
      expect(newMessageLinks.length).toBeGreaterThan(0);
      expect(newMessageLinks[0].closest("a")).toHaveAttribute(
        "href",
        "/dashboard/messages/new"
      );
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

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });
});
