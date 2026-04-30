# Messaging System - Phase 2: Guest/Customer Messaging UI

## Overview
Phase 2 implements the complete guest/customer messaging UI with React components for viewing conversations, sending messages, and initiating pre-booking inquiries.

## What Was Implemented

### 1. Core Components

#### MessagesPage.tsx
Main messaging page component that displays:
- Sidebar with conversation list
- Main content area with conversation thread
- Search functionality
- Unread message count badge
- Empty states

**Features:**
- Loads conversations from API
- Filters conversations by search term
- Displays unread count per conversation
- Calculates total unread messages
- Responsive layout (sidebar + content)
- Relative date formatting (e.g., "2h ago")

**Props:** None (uses API client directly)

**State:**
- `conversations` - List of all conversations
- `selectedConversation` - Currently selected conversation
- `loading` - Loading state
- `error` - Error message
- `searchTerm` - Search filter
- `filteredConversations` - Filtered conversation list
- `totalUnread` - Total unread message count

#### ConversationThread.tsx
Displays a single conversation with messages and message composer.

**Features:**
- Loads messages for selected conversation
- Displays messages with sender role badges
- Shows date separators between days
- Supports different message types (TEXT, SYSTEM, UPGRADE_OFFER)
- Auto-scrolls to latest message
- Marks messages as read
- Disables composer when conversation is closed
- Displays upgrade offers with details

**Props:**
- `conversation` - Conversation object
- `onClose` - Callback when closing conversation
- `onNewMessage` - Callback when new message is sent

**State:**
- `messages` - List of messages
- `loading` - Loading state
- `error` - Error message
- `sending` - Sending state

#### MessageComposer.tsx
Reusable message input component.

**Features:**
- Textarea with character counter
- Send button with loading state
- Keyboard shortcut (Ctrl+Enter to send)
- Character limit (5000 chars)
- Disabled state support
- Error handling
- Custom placeholder support

**Props:**
- `onSendMessage` - Callback to send message
- `disabled` - Disable input
- `placeholder` - Custom placeholder text

**State:**
- `content` - Message content
- `sending` - Sending state
- `error` - Error message

#### PreBookingInquiry.tsx
Form for guests to send inquiries before booking.

**Features:**
- Subject and message fields
- Character limits (255 for subject, 5000 for message)
- Form validation
- Success message with redirect
- Tips section
- Error handling
- Loading state

**Props:**
- `hotelId` - Hotel ID
- `hotelName` - Hotel name for display
- `onSuccess` - Optional callback on success

**State:**
- `subject` - Inquiry subject
- `description` - Inquiry message
- `loading` - Loading state
- `error` - Error message
- `success` - Success state

### 2. Styling

#### MessagesPage.css
- Responsive two-column layout (sidebar + content)
- Conversation list styling with hover effects
- Active conversation highlighting
- Unread conversation styling
- Mobile responsive (stacks vertically)
- Scrollbar styling

#### ConversationThread.css
- Message display with role-based styling
- Date separators
- Different styles for message types (TEXT, SYSTEM, UPGRADE_OFFER)
- Role badges with color coding
- Responsive message layout
- Scrollbar styling

#### MessageComposer.css
- Textarea with focus states
- Character counter
- Send button styling
- Responsive layout
- Mobile-friendly input

#### PreBookingInquiry.css
- Form card styling
- Input field styling
- Tips section styling
- Success/error message styling
- Responsive form layout

### 3. Component Tests

#### MessagesPage.test.tsx
Tests for:
- Loading state
- Conversation loading and display
- Unread count badge
- Search filtering
- Empty state
- Error handling
- Conversation selection
- Total unread calculation
- Navigation links
- Date formatting

#### ConversationThread.test.tsx
Tests for:
- Loading state
- Message loading and display
- Conversation header
- Empty state
- Message composer display
- Message sending
- Role badges
- Closed conversation handling
- Close button functionality
- Error handling
- System message display

#### PreBookingInquiry.test.tsx
Tests for:
- Form rendering
- Field validation
- Form submission
- Success message
- Redirect on success
- Success callback
- Error handling
- Character limits
- Tips display
- Button states
- Cancel functionality

### 4. Integration Points

#### Dashboard Integration
Add to dashboard navigation:
```tsx
<Link href="/dashboard/messages" className="nav-link">
  <i className="ri-mail-line"></i>
  Messages
  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</Link>
```

#### Booking Detail Integration
Add message button to booking details:
```tsx
<Link href={`/dashboard/messages/new?bookingId=${booking.id}`} className="btn btn-primary">
  <i className="ri-mail-line"></i>
  Message Hotel
</Link>
```

#### Hotel Detail Integration
Add inquiry button to hotel details:
```tsx
<Link href={`/dashboard/messages/new?hotelId=${hotel.id}`} className="btn btn-primary">
  <i className="ri-mail-line"></i>
  Send Inquiry
</Link>
```

### 5. API Integration

The components use the following API endpoints:

**GET /api/messages/conversations**
- Lists all conversations for the user
- Supports pagination (limit, offset)
- Returns conversations with unread counts

**GET /api/messages/conversations/:id**
- Gets conversation with messages
- Supports pagination for messages
- Marks conversation as read

**POST /api/messages/conversations/:id/messages**
- Sends a message in conversation
- Automatically sanitizes sensitive data
- Returns created message

**PUT /api/messages/:id/read**
- Marks message as read
- Updates read receipt

**POST /api/messages/conversations**
- Creates new conversation
- Used by PreBookingInquiry component

## Usage Examples

### Using MessagesPage
```tsx
import MessagesPage from "@/components/Messaging/MessagesPage";

export default function Page() {
  return <MessagesPage />;
}
```

### Using PreBookingInquiry
```tsx
import PreBookingInquiry from "@/components/Messaging/PreBookingInquiry";

export default function HotelDetail({ hotel }: any) {
  return (
    <PreBookingInquiry
      hotelId={hotel.id}
      hotelName={hotel.name}
      onSuccess={() => console.log("Inquiry sent!")}
    />
  );
}
```

### Using MessageComposer Standalone
```tsx
import MessageComposer from "@/components/Messaging/MessageComposer";

export default function CustomMessaging() {
  const handleSend = async (content: string) => {
    // Custom send logic
  };

  return (
    <MessageComposer
      onSendMessage={handleSend}
      placeholder="Type your message..."
    />
  );
}
```

## Features

### Message Display
- **Role Badges**: Color-coded badges showing sender role
  - GUEST: Blue
  - BROKER: Yellow
  - HOTEL_STAFF: Green
  - MANAGER: Primary
  - ADMIN: Red

- **Message Types**:
  - TEXT: Regular messages
  - SYSTEM: System notifications (italicized)
  - UPGRADE_OFFER: Special offer messages with details

- **Timestamps**: Shows time for each message and date separators

### Search & Filter
- Real-time search filtering
- Searches both subject and description
- Minimum 2 characters for API search

### Unread Management
- Unread count per conversation
- Total unread count in header
- Auto-mark as read when viewing conversation
- Visual indicators for unread conversations

### Responsive Design
- Desktop: Two-column layout (sidebar + content)
- Tablet: Stacked layout with adjustable heights
- Mobile: Full-width with collapsible sidebar

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Security Features

### Sensitive Data Sanitization
- Card numbers masked (****-****-****-9010)
- CVV/CVC codes redacted
- Bank account numbers redacted
- SSN redacted
- Automatic on message creation

### Access Control
- Only participants can view conversation
- Only authenticated users can message
- Conversation status prevents messaging when closed

### Input Validation
- Character limits enforced
- Empty message prevention
- Subject/description validation

## Performance Optimizations

### Lazy Loading
- Messages loaded on demand
- Pagination support (50 messages per page)
- Conversation list pagination

### Caching
- Conversations cached in component state
- Messages cached per conversation
- Refresh on new message

### Rendering
- Efficient list rendering
- Memoization of components
- Conditional rendering for empty states

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Files Created

### Components
- `frontend/src/components/Messaging/MessagesPage.tsx`
- `frontend/src/components/Messaging/ConversationThread.tsx`
- `frontend/src/components/Messaging/MessageComposer.tsx`
- `frontend/src/components/Messaging/PreBookingInquiry.tsx`

### Styles
- `frontend/src/components/Messaging/MessagesPage.css`
- `frontend/src/components/Messaging/ConversationThread.css`
- `frontend/src/components/Messaging/MessageComposer.css`
- `frontend/src/components/Messaging/PreBookingInquiry.css`

### Tests
- `frontend/src/components/Messaging/__tests__/MessagesPage.test.tsx`
- `frontend/src/components/Messaging/__tests__/ConversationThread.test.tsx`
- `frontend/src/components/Messaging/__tests__/PreBookingInquiry.test.tsx`

## Running Tests

### Unit Tests
```bash
cd frontend
npm test -- MessagesPage.test.tsx
npm test -- ConversationThread.test.tsx
npm test -- PreBookingInquiry.test.tsx
```

### All Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

## Next Steps

Phase 3 will implement the Broker Messaging UI with:
- Conversations for bookings created by broker
- Message hotel about booking
- Message customer about booking
- See upgrade offers from hotel

## Architecture Notes

### Component Hierarchy
```
MessagesPage
├── ConversationList (sidebar)
│   └── ConversationItem (list items)
└── ConversationThread (main content)
    ├── MessageList
    │   └── Message (individual messages)
    └── MessageComposer
```

### State Management
- Local component state for UI state
- API client for data fetching
- No global state management needed (can be added later)

### Styling Approach
- CSS modules for component isolation
- Responsive design with media queries
- Bootstrap utility classes for common styles
- Custom CSS for component-specific styling

### API Integration
- Centralized API client (`@/lib/api`)
- Error handling at component level
- Loading states for async operations
- Automatic retry on failure (can be added)

## Known Limitations

1. **Real-time Updates**: Messages don't update in real-time (polling needed)
2. **Typing Indicators**: Not implemented
3. **Message Reactions**: Not implemented
4. **File Uploads**: Not implemented
5. **Message Editing**: Not implemented
6. **Message Deletion**: Not implemented (soft delete only)

## Future Enhancements

1. WebSocket integration for real-time messaging
2. Typing indicators
3. Message reactions/emojis
4. File/image uploads
5. Message editing and deletion
6. Message search within conversation
7. Conversation pinning
8. Message forwarding
9. Read receipts with timestamps
10. Notification system

## Status
✅ Phase 2 Complete - Guest/Customer Messaging UI fully implemented with components, styling, and comprehensive tests.

Next: Phase 3 - Broker Messaging UI
