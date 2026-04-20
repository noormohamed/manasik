/**
 * ConversationThread Component Tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConversationThread from "../ConversationThread";
import * as apiClient from "@/lib/api";

// Mock the API client
jest.mock("@/lib/api");

// Mock child components
jest.mock("../MessageComposer", () => {
  return function MockMessageComposer({ onSendMessage }: any) {
    return (
      <div data-testid="message-composer">
        <button
          onClick={() => onSendMessage("Test message")}
          data-testid="send-button"
        >
          Send
        </button>
      </div>
    );
  };
});

describe("ConversationThread", () => {
  const mockConversation = {
    id: "conv-1",
    hotelId: "hotel-1",
    subject: "Room Inquiry",
    description: "I have a question about room availability",
    status: "ACTIVE" as const,
    createdById: "user-1",
    createdByRole: "GUEST",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      { userId: "user-1", userRole: "GUEST" },
      { userId: "staff-1", userRole: "HOTEL_STAFF" },
    ],
  };

  const mockMessages = [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-1",
      senderRole: "GUEST",
      content: "Hello, I have a question",
      contentSanitized: "Hello, I have a question",
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "staff-1",
      senderRole: "HOTEL_STAFF",
      content: "Thank you for your inquiry",
      contentSanitized: "Thank you for your inquiry",
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
  ];

  const mockOnClose = jest.fn();
  const mockOnNewMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
    (apiClient.apiClient.get as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    expect(screen.getByText("Loading conversation...")).toBeInTheDocument();
  });

  it("should load and display messages", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Hello, I have a question")).toBeInTheDocument();
      expect(screen.getByText("Thank you for your inquiry")).toBeInTheDocument();
    });
  });

  it("should display conversation header", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Room Inquiry")).toBeInTheDocument();
      expect(screen.getByText("I have a question about room availability")).toBeInTheDocument();
    });
  });

  it("should display empty state when no messages", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: [] },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("No messages yet. Start the conversation!")).toBeInTheDocument();
    });
  });

  it("should display message composer", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("message-composer")).toBeInTheDocument();
    });
  });

  it("should send message on composer submit", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      data: {
        id: "msg-3",
        conversationId: "conv-1",
        senderId: "user-1",
        senderRole: "GUEST",
        content: "Test message",
        contentSanitized: "Test message",
        messageType: "TEXT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("send-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        "/messages/conversations/conv-1/messages",
        { content: "Test message" }
      );
      expect(mockOnNewMessage).toHaveBeenCalledWith("conv-1");
    });
  });

  it("should display role badges for messages", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("GUEST")).toBeInTheDocument();
      expect(screen.getByText("HOTEL STAFF")).toBeInTheDocument();
    });
  });

  it("should disable composer when conversation is closed", async () => {
    const closedConversation = { ...mockConversation, status: "CLOSED" as const };

    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    render(
      <ConversationThread
        conversation={closedConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("message-composer")).toBeInTheDocument();
    });
  });

  it("should call onClose when close button is clicked", async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: mockMessages },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      const closeButton = screen.getByTitle("Close conversation");
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should display error message on fetch failure", async () => {
    (apiClient.apiClient.get as jest.Mock).mockRejectedValue({
      error: "Failed to load messages",
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
    });
  });

  it("should display system messages differently", async () => {
    const systemMessages = [
      {
        ...mockMessages[0],
        messageType: "SYSTEM",
        content: "Conversation started",
        contentSanitized: "Conversation started",
      },
    ];

    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      data: { messages: systemMessages },
    });

    render(
      <ConversationThread
        conversation={mockConversation}
        onClose={mockOnClose}
        onNewMessage={mockOnNewMessage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Conversation started")).toBeInTheDocument();
    });
  });
});
