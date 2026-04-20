import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HotelMessagesPage from "../HotelMessagesPage";
import * as apiModule from "@/lib/api";

// Mock the API client
jest.mock("@/lib/api");
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const mockConversations = [
  {
    id: "conv-1",
    hotelId: "hotel-1",
    bookingId: "booking-1",
    subject: "Room Upgrade Request",
    description: "Guest requesting room upgrade",
    status: "ACTIVE" as const,
    createdById: "user-1",
    createdByRole: "GUEST",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 2,
    lastMessage: {
      content: "Can I upgrade to a suite?",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "conv-2",
    hotelId: "hotel-1",
    subject: "Booking Confirmation",
    status: "CLOSED" as const,
    createdById: "user-2",
    createdByRole: "BROKER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
    lastMessage: {
      content: "Booking confirmed",
      createdAt: new Date().toISOString(),
    },
  },
];

const mockStaff = [
  {
    id: "staff-1",
    firstName: "John",
    lastName: "Doe",
    email: "john@hotel.com",
    role: "Manager",
  },
  {
    id: "staff-2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@hotel.com",
    role: "Staff",
  },
];

describe("HotelMessagesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiModule.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });
  });

  it("renders the hotel messages page", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Conversations")).toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    (apiModule.apiClient.get as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockConversations }), 100)
        )
    );

    render(<HotelMessagesPage />);
    expect(screen.getByText("Loading conversations...")).toBeInTheDocument();
  });

  it("displays conversations list", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });
  });

  it("displays unread count badge", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("filters conversations by status", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const closedButton = screen.getByRole("button", { name: /closed/i });
    fireEvent.click(closedButton);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Room Upgrade Request")).not.toBeInTheDocument();
    });
  });

  it("searches conversations", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search conversations...");
    fireEvent.change(searchInput, { target: { value: "Booking" } });

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Room Upgrade Request")).not.toBeInTheDocument();
    });
  });

  it("selects a conversation", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });
  });

  it("displays error message on fetch failure", async () => {
    (apiModule.apiClient.get as jest.Mock).mockRejectedValue({
      error: "Failed to load conversations",
    });

    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load conversations")).toBeInTheDocument();
    });
  });

  it("displays empty state when no conversations", async () => {
    (apiModule.apiClient.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    });
  });

  it("displays empty state for search with no results", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search conversations...");
    fireEvent.change(searchInput, { target: { value: "NonexistentConversation" } });

    await waitFor(() => {
      expect(
        screen.getByText("No conversations match your search")
      ).toBeInTheDocument();
    });
  });

  it("displays status badges correctly", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
      expect(screen.getByText("CLOSED")).toBeInTheDocument();
    });
  });

  it("displays conversation metadata", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByText(/Booking:/)).toBeInTheDocument();
    });
  });

  it("shows assign button when conversation is selected", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /assign/i })).toBeInTheDocument();
    });
  });

  it("shows status dropdown menu", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      const moreButton = screen.getByRole("button", { name: /more/i });
      expect(moreButton).toBeInTheDocument();
    });
  });

  it("displays total unread count", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("filters by all status", async () => {
    render(<HotelMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const allButton = screen.getByRole("button", { name: /^All$/ });
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });
  });
});
