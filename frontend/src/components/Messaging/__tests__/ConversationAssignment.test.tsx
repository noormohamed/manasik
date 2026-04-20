import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConversationAssignment from "../ConversationAssignment";

const mockConversation = {
  id: "conv-1",
  subject: "Room Upgrade Request",
  assignedToId: "staff-1",
  assignedToName: "John Doe",
};

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
  {
    id: "staff-3",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob@hotel.com",
    role: "Staff",
  },
];

describe("ConversationAssignment", () => {
  const mockOnAssign = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the assignment modal", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Assign Conversation")).toBeInTheDocument();
  });

  it("displays all staff members", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays staff email addresses", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("john@hotel.com")).toBeInTheDocument();
    expect(screen.getByText("jane@hotel.com")).toBeInTheDocument();
    expect(screen.getByText("bob@hotel.com")).toBeInTheDocument();
  });

  it("displays staff roles", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.getAllByText("Staff").length).toBeGreaterThan(0);
  });

  it("pre-selects currently assigned staff", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
  });

  it("allows selecting a different staff member", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);

    expect(radios[1]).toBeChecked();
  });

  it("calls onAssign with selected staff ID", async () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);

    const assignButton = screen.getByRole("button", { name: /assign/i });
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(mockOnAssign).toHaveBeenCalledWith("staff-2");
    });
  });

  it("disables assign button when no staff is selected", () => {
    const unassignedConversation = {
      ...mockConversation,
      assignedToId: undefined,
      assignedToName: undefined,
    };

    render(
      <ConversationAssignment
        conversation={unassignedConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const assignButton = screen.getByRole("button", { name: /assign/i });
    expect(assignButton).toBeDisabled();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes modal when clicking outside", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const overlay = screen.getByText("Assign Conversation").closest(".assignment-modal-overlay");
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays empty state when no staff available", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={[]}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("No staff members available")).toBeInTheDocument();
  });

  it("shows loading state when assigning", async () => {
    const slowOnAssign = jest.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(undefined), 100)
        )
    );

    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={slowOnAssign}
        onClose={mockOnClose}
      />
    );

    const assignButton = screen.getByRole("button", { name: /assign/i });
    fireEvent.click(assignButton);

    expect(screen.getByText("Assigning...")).toBeInTheDocument();
  });

  it("displays staff item with correct styling", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const staffItems = screen.getAllByRole("radio");
    expect(staffItems.length).toBe(mockStaff.length);
  });

  it("allows clicking on staff item to select", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    const staffName = screen.getByText("Jane Smith");
    fireEvent.click(staffName);

    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toBeChecked();
  });

  it("displays description text", () => {
    render(
      <ConversationAssignment
        conversation={mockConversation}
        staff={mockStaff}
        onAssign={mockOnAssign}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByText("Assign this conversation to a team member")
    ).toBeInTheDocument();
  });
});
