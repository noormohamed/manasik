/**
 * PreBookingInquiry Component Tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PreBookingInquiry from "../PreBookingInquiry";
import * as apiClient from "@/lib/api";
import { useRouter } from "next/navigation";

// Mock the API client
jest.mock("@/lib/api");

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("PreBookingInquiry", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render inquiry form", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Send Inquiry to Test Hotel")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByText("Send Inquiry")).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Subject is required")).toBeInTheDocument();
    });
  });

  it("should validate message is required", async () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Message is required")).toBeInTheDocument();
    });
  });

  it("should submit inquiry with valid data", async () => {
    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      data: { id: "conv-1" },
    });

    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByLabelText("Message");

    fireEvent.change(subjectInput, { target: { value: "Room Availability" } });
    fireEvent.change(messageInput, { target: { value: "I would like to know about room availability" } });

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        "/messages/conversations",
        expect.objectContaining({
          hotelId: "hotel-1",
          subject: "Room Availability",
          description: "I would like to know about room availability",
        })
      );
    });
  });

  it("should show success message after submission", async () => {
    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      data: { id: "conv-1" },
    });

    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByLabelText("Message");

    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, { target: { value: "Test Message" } });

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Inquiry sent!")).toBeInTheDocument();
    });
  });

  it("should redirect to messages page after success", async () => {
    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      data: { id: "conv-1" },
    });

    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByLabelText("Message");

    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, { target: { value: "Test Message" } });

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/messages");
      },
      { timeout: 3000 }
    );
  });

  it("should call onSuccess callback after submission", async () => {
    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      data: { id: "conv-1" },
    });

    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByLabelText("Message");

    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, { target: { value: "Test Message" } });

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockOnSuccess).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it("should display error message on submission failure", async () => {
    (apiClient.apiClient.post as jest.Mock).mockRejectedValue({
      error: "Failed to send inquiry",
    });

    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByLabelText("Message");

    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, { target: { value: "Test Message" } });

    const submitButton = screen.getByText("Send Inquiry");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to send inquiry")).toBeInTheDocument();
    });
  });

  it("should enforce character limits", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject") as HTMLInputElement;
    const messageInput = screen.getByLabelText("Message") as HTMLTextAreaElement;

    expect(subjectInput.maxLength).toBe(255);
    expect(messageInput.maxLength).toBe(5000);
  });

  it("should display tips for inquiry", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Tips for your inquiry:")).toBeInTheDocument();
    expect(screen.getByText("Be specific about your needs or questions")).toBeInTheDocument();
    expect(screen.getByText("Include your preferred dates if applicable")).toBeInTheDocument();
  });

  it("should disable submit button when fields are empty", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText("Send Inquiry") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("should enable submit button when fields are filled", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText("Subject");
    const messageInput = screen.getByLabelText("Message");

    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, { target: { value: "Test Message" } });

    const submitButton = screen.getByText("Send Inquiry") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it("should have cancel button", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeInTheDocument();
  });

  it("should call router.back on cancel", () => {
    render(
      <PreBookingInquiry
        hotelId="hotel-1"
        hotelName="Test Hotel"
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });
});
