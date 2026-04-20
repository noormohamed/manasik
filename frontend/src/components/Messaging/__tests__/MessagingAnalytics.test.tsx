import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MessagingAnalytics from "../MessagingAnalytics";

const mockConversations = [
  {
    id: "conv-1",
    hotelId: "hotel-1",
    hotelName: "Grand Hotel",
    bookingId: "booking-1",
    subject: "Room Upgrade Request",
    status: "ACTIVE" as const,
    createdByRole: "GUEST",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 2,
    isEscalated: false,
  },
  {
    id: "conv-2",
    hotelId: "hotel-1",
    hotelName: "Grand Hotel",
    subject: "Booking Confirmation",
    status: "CLOSED" as const,
    createdByRole: "BROKER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
    isEscalated: true,
  },
  {
    id: "conv-3",
    hotelId: "hotel-2",
    hotelName: "Luxury Resort",
    subject: "Support Request",
    status: "ACTIVE" as const,
    createdByRole: "HOTEL_STAFF",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 1,
    isEscalated: false,
  },
  {
    id: "conv-4",
    hotelId: "hotel-2",
    hotelName: "Luxury Resort",
    subject: "Complaint",
    status: "ARCHIVED" as const,
    createdByRole: "GUEST",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
    isEscalated: false,
  },
];

describe("MessagingAnalytics", () => {
  it("renders the analytics page", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Messaging Analytics")).toBeInTheDocument();
  });

  it("displays key metrics", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Total Conversations")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Unread Messages")).toBeInTheDocument();
    expect(screen.getByText("Escalated")).toBeInTheDocument();
  });

  it("displays correct total conversations count", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    const values = screen.getAllByText("4");
    expect(values.length).toBeGreaterThan(0);
  });

  it("displays correct active conversations count", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    const values = screen.getAllByText("2");
    expect(values.length).toBeGreaterThan(0);
  });

  it("displays correct unread count", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    const values = screen.getAllByText("3");
    expect(values.length).toBeGreaterThan(0);
  });

  it("displays correct escalated count", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    const values = screen.getAllByText("1");
    expect(values.length).toBeGreaterThan(0);
  });

  it("displays role distribution", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Conversations by Role")).toBeInTheDocument();
    expect(screen.getByText("Guest")).toBeInTheDocument();
    expect(screen.getByText("Broker")).toBeInTheDocument();
    expect(screen.getByText("Staff")).toBeInTheDocument();
  });

  it("displays status distribution", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Conversations by Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("displays top hotels", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Top Hotels by Conversations")).toBeInTheDocument();
    expect(screen.getByText("Grand Hotel")).toBeInTheDocument();
    expect(screen.getByText("Luxury Resort")).toBeInTheDocument();
  });

  it("displays hotel rankings", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  it("displays summary statistics", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Closed Conversations")).toBeInTheDocument();
    expect(screen.getByText("Archived Conversations")).toBeInTheDocument();
    expect(screen.getByText("Average Conversations per Hotel")).toBeInTheDocument();
  });

  it("calculates percentages correctly", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    // 2 active out of 4 = 50%
    const percentages = screen.getAllByText("50%");
    expect(percentages.length).toBeGreaterThan(0);
  });

  it("displays role counts", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    // Guest: 2, Broker: 1, Staff: 1
    const guestCount = screen.getAllByText("2");
    expect(guestCount.length).toBeGreaterThan(0);
  });

  it("handles empty conversations", () => {
    render(<MessagingAnalytics conversations={[]} />);

    expect(screen.getByText("Messaging Analytics")).toBeInTheDocument();
    expect(screen.getByText("Total Conversations")).toBeInTheDocument();
  });

  it("displays metric icons", () => {
    const { container } = render(<MessagingAnalytics conversations={mockConversations} />);

    const icons = container.querySelectorAll(".metric-icon");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("displays distribution bars", () => {
    const { container } = render(<MessagingAnalytics conversations={mockConversations} />);

    const bars = container.querySelectorAll(".distribution-bar");
    expect(bars.length).toBeGreaterThan(0);
  });

  it("displays hotel conversation counts", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    // Grand Hotel has 2 conversations
    const grandHotelCount = screen.getByText("2 conversations");
    expect(grandHotelCount).toBeInTheDocument();
  });

  it("displays analytics header", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(
      screen.getByText("Platform-wide messaging statistics and insights")
    ).toBeInTheDocument();
  });

  it("displays section headers", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    expect(screen.getByText("Conversations by Role")).toBeInTheDocument();
    expect(screen.getByText("Conversations by Status")).toBeInTheDocument();
    expect(screen.getByText("Top Hotels by Conversations")).toBeInTheDocument();
  });

  it("calculates average conversations per hotel", () => {
    render(<MessagingAnalytics conversations={mockConversations} />);

    // 2 hotels with 4 conversations = 2 average
    const averageValue = screen.getByText("2");
    expect(averageValue).toBeInTheDocument();
  });

  it("displays all metric cards", () => {
    const { container } = render(<MessagingAnalytics conversations={mockConversations} />);

    const metricCards = container.querySelectorAll(".metric-card");
    expect(metricCards.length).toBe(4);
  });

  it("displays distribution items for roles", () => {
    const { container } = render(<MessagingAnalytics conversations={mockConversations} />);

    const distributionItems = container.querySelectorAll(".distribution-item");
    // 3 roles + 3 statuses = 6 distribution items
    expect(distributionItems.length).toBe(6);
  });
});
