import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminMessagesPage from "../AdminMessagesPage";
import * as apiModule from "@/lib/api";

jest.mock("@/lib/api");
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const mockConversations = [
  {
    id: "conv-1",
    hotelId: "hotel-1",
    hotelName: "Grand Hotel",
    bookingId: "booking-1",
    subject: "Room Upgrade Request",
    description: "Guest requesting room upgrade",
    status: "ACTIVE" as const,
    createdById: "user-1",
    createdByRole: "GUEST",
    createdByName: "John Guest",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 2,
    isEscalated: false,
    lastMessage: {
      content: "Can I upgrade to a suite?",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "conv-2",
    hotelId: "hotel-2",
    hotelName: "Luxury Resort",
    subject: "Booking Confirmation",
    status: "CLOSED" as const,
    createdById: "user-2",
    createdByRole: "BROKER",
    createdByName: "Jane Broker",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
    isEscalated: true,
    lastMessage: {
      content: "Booking confirmed",
      createdAt: new Date().toISOString(),
    },
  },
];

describe("AdminMessagesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiModule.apiClient.get as jest.Mock).mockResolvedValue({
      data: mockConversations,
    });
    (apiModule.apiClient.post as jest.Mock).mockResolvedValue({
      data: {},
    });
  });

  it("renders the admin messages page", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("All Conversations")).toBeInTheDocument();
    });
  });

  it("displays view mode tabs", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /conversations/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /analytics/i })).toBeInTheDocument();
    });
  });

  it("displays conversations in default view", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });
  });

  it("switches to analytics view", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const analyticsButton = screen.getByRole("button", { name: /analytics/i });
    fireEvent.click(analyticsButton);

    await waitFor(() => {
      expect(screen.getByText("Messaging Analytics")).toBeInTheDocument();
    });
  });

  it("filters conversations by status", async () => {
    render(<AdminMessagesPage />);

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

  it("filters conversations by role", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const brokerButton = screen.getByRole("button", { name: /brokers/i });
    fireEvent.click(brokerButton);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Room Upgrade Request")).not.toBeInTheDocument();
    });
  });

  it("filters escalated conversations only", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const escalatedCheckbox = screen.getByRole("checkbox");
    fireEvent.click(escalatedCheckbox);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Room Upgrade Request")).not.toBeInTheDocument();
    });
  });

  it("searches conversations", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search conversations/i);
    fireEvent.change(searchInput, { target: { value: "Booking" } });

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
      expect(screen.queryByText("Room Upgrade Request")).not.toBeInTheDocument();
    });
  });

  it("displays hotel names in conversation list", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Grand Hotel")).toBeInTheDocument();
      expect(screen.getByText("Luxury Resort")).toBeInTheDocument();
    });
  });

  it("displays escalated badge for escalated conversations", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      const escalatedBadges = screen.getAllByText("Escalated");
      expect(escalatedBadges.length).toBeGreaterThan(0);
    });
  });

  it("displays unread count badge", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("selects a conversation", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });
  });

  it("shows escalate button for non-escalated conversations", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /escalate/i })).toBeInTheDocument();
    });
  });

  it("shows resolve button for escalated conversations", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Booking Confirmation");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /resolve/i })).toBeInTheDocument();
    });
  });

  it("escalates a conversation", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      const escalateButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(escalateButton);
    });

    expect(apiModule.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining("/escalate"),
      expect.anything()
    );
  });

  it("displays error message on fetch failure", async () => {
    (apiModule.apiClient.get as jest.Mock).mockRejectedValue({
      error: "Failed to load conversations",
    });

    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load conversations")).toBeInTheDocument();
    });
  });

  it("displays empty state when no conversations", async () => {
    (apiModule.apiClient.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("No conversations found")).toBeInTheDocument();
    });
  });

  it("displays total unread count in tab", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("displays conversation metadata", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("Room Upgrade Request")).toBeInTheDocument();
    });

    const conversationItem = screen.getByText("Room Upgrade Request");
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByText("Grand Hotel")).toBeInTheDocument();
      expect(screen.getByText("John Guest")).toBeInTheDocument();
    });
  });

  it("filters by all status", async () => {
    render(<AdminMessagesPage />);

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

  it("displays status badges correctly", async () => {
    render(<AdminMessagesPage />);

    await waitFor(() => {
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
      expect(screen.getByText("CLOSED")).toBeInTheDocument();
    });
  });
});
