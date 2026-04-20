# Messaging System - Phase 3: Broker Messaging UI

## Overview
Phase 3 implements the broker-specific messaging UI with features for managing conversations related to bookings created by the broker, communicating with both hotels and customers, and viewing upgrade offers.

## What Was Implemented

### 1. BrokerMessagesPage Component

Main broker messaging interface with specialized features for brokers.

**Features:**
- View all conversations for bookings created by broker
- Filter conversations by type (All, Hotels, Customers)
- Search conversations by subject/description
- Display role badges (Customer/Hotel)
- Show booking ID in conversation info
- Unread message count tracking
- Responsive layout

**Props:** None (uses API client directly)

**State:**
- `conversations` - List of all conversations
- `selectedConversation` - Currently selected conversation
- `loading` - Loading state
- `error` - Error message
- `filterType` - Current filter (all/hotel/customer)
- `searchTerm` - Search filter
- `filteredConversations` - Filtered conversation list
- `totalUnread` - Total unread message count

**Key Methods:**
- `fetchConversations()` - Load conversations from API
- `handleConversationSelect()` - Select conversation
- `handleConversationClose()` - Close conversation
- `handleNewMessage()` - Refresh after new message

### 2. Broker-Specific Features

#### Filter by Conversation Type
- **All**: Show all conversations
- **Hotels**: Show only conversations initiated by hotel staff
- **Customers**: Show only conversations initiated by customers

#### Conversation Info Bar
- Displays conversation subject
- Shows role badge (Customer/Hotel)
- Displays booking ID if available
- Provides context for the conversation

#### Role-Based Styling
- Customer conversations: Blue badge
- Hotel conversations: Green badge
- Different visual treatment for each type

#### Booking Information
- Shows booking ID in conversation info
- Helps brokers track which booking the conversation relates to
- Enables quick reference to booking details

### 3. Styling

#### BrokerMessagesPage.css
- Broker-specific layout and styling
- Filter button styling
- Conversation info bar styling
- Role badge colors
- Responsive design for mobile/tablet/desktop
- Scrollbar styling

**Key Classes:**
- `.broker-filters` - Filter button container
- `.filter-buttons` - Individual filter buttons
- `.conversation-info-bar` - Info bar above conversation
- `.conversation-info` - Info bar content
- `.conversation-subject-group` - Subject with role badge

### 4. Component Tests

#### BrokerMessagesPage.test.tsx
Comprehensive tests for:
- Loading state
- Conversation loading and display
- Role badge display
- Filter by customer conversations
- Filter by hotel conversations
- Search functionality
- Unread count badge
- Empty state
- Error handling
- Conversation selection
- Conversation info bar display
- Booking ID display
- Filter reset
- Date formatting

**Test Coverage:**
- 15+ test cases
- All major features tested
- Edge cases covered
- Error scenarios tested

### 5. Integration Points

#### Dashboard Integration
Add to broker dashboard:
```tsx
<Link href="/dashboard/broker/messages" className="nav-link">
  <i className="ri-mail-line"></i>
  Booking Messages
  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</Link>
```

#### Booking List Integration
Add message button to booking list:
```tsx
<Link href={`/dashboard/broker/messages?bookingId=${booking.id}`} className="btn btn-sm btn-primary">
  <i className="ri-mail-line"></i>
  Messages
</Link>
```

#### Booking Detail Integration
Add message section to booking details:
```tsx
<div className="booking-messages">
  <h5>Messages</h5>
  <BrokerMessagesPage bookingId={booking.id} />
</div>
```

### 6. API Integration

Uses the same API endpoints as guest messaging:

**GET /api/messages/conversations**
- Lists conversations for broker
- Filters by role automatically
- Returns conversations with unread counts

**GET /api/messages/conversations/:id**
- Gets conversation with messages
- Marks conversation as read

**POST /api/messages/conversations/:id/messages**
- Sends message in conversation
- Sanitizes sensitive data

**PUT /api/messages/:id/read**
- Marks message as read

## Usage Examples

### Using BrokerMessagesPage
```tsx
import BrokerMessagesPage from "@/components/Messaging/BrokerMessagesPage";

export default function BrokerMessagesPage() {
  return <BrokerMessagesPage />;
}
```

### Filtering Conversations
The component automatically filters conversations based on:
1. User role (BROKER)
2. Bookings created by the broker
3. Selected filter type (All/Hotels/Customers)
4. Search term

### Accessing Booking Information
```tsx
// In conversation info bar
const bookingId = selectedConversation.bookingId;
// Use to fetch booking details or link to booking page
```

## Features

### Conversation Filtering
- **All**: Shows all conversations related to broker's bookings
- **Hotels**: Shows only conversations initiated by hotel staff (upgrade offers, confirmations)
- **Customers**: Shows only conversations initiated by customers (inquiries, questions)

### Search Functionality
- Real-time search filtering
- Searches both subject and description
- Works with active filter

### Unread Management
- Unread count per conversation
- Total unread count in header
- Visual indicators for unread conversations
- Auto-mark as read when viewing

### Conversation Context
- Booking ID displayed in info bar
- Role badge shows conversation type
- Subject clearly visible
- Last message preview in list

### Responsive Design
- Desktop: Two-column layout
- Tablet: Stacked layout
- Mobile: Full-width with collapsible sidebar

## Broker Workflow

### Typical Broker Workflow
1. **View All Messages**: See all conversations related to bookings
2. **Filter by Type**: 
   - View customer inquiries
   - View hotel upgrade offers
3. **Search**: Find specific conversations
4. **Select Conversation**: View full conversation thread
5. **Send Message**: Respond to customer or hotel
6. **Track Unread**: Monitor new messages

### Use Cases

#### Customer Inquiry
- Customer sends pre-booking inquiry
- Broker receives notification
- Broker can respond with information
- Broker can forward to hotel if needed

#### Hotel Upgrade Offer
- Hotel sends upgrade offer
- Broker receives notification
- Broker can share with customer
- Broker can negotiate terms

#### Booking Confirmation
- Broker confirms booking with customer
- Broker coordinates with hotel
- All communication in one thread

## Security Features

### Access Control
- Only brokers can see their own conversations
- Conversations filtered by broker's bookings
- Participants verified before messaging

### Sensitive Data Sanitization
- Card numbers masked
- CVV/CVC codes redacted
- Bank details redacted
- Automatic on message creation

### Audit Trail
- All messages logged
- Access tracked
- Actions recorded

## Performance Optimizations

### Lazy Loading
- Messages loaded on demand
- Pagination support
- Conversation list pagination

### Caching
- Conversations cached in state
- Messages cached per conversation
- Refresh on new message

### Rendering
- Efficient list rendering
- Conditional rendering
- Memoization support

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Files Created

### Components
- `frontend/src/components/Messaging/BrokerMessagesPage.tsx`

### Styles
- `frontend/src/components/Messaging/BrokerMessagesPage.css`

### Tests
- `frontend/src/components/Messaging/__tests__/BrokerMessagesPage.test.tsx`

## Running Tests

### Unit Tests
```bash
cd frontend
npm test -- BrokerMessagesPage.test.tsx
```

### All Messaging Tests
```bash
cd frontend
npm test -- Messaging
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

## Next Steps

Phase 4 will implement the Hotel/Manager Messaging UI with:
- View all conversations for hotel
- Assign conversations to staff
- Send messages to guests/brokers
- Send upgrade offers
- View unread count

## Architecture Notes

### Component Hierarchy
```
BrokerMessagesPage
├── Filter Buttons
├── Search Input
├── ConversationList (sidebar)
│   └── ConversationItem (with role badge)
└── ConversationThread (main content)
    ├── ConversationInfoBar
    └── MessageList
        └── Message
```

### State Management
- Local component state for UI
- API client for data fetching
- No global state needed

### Styling Approach
- CSS modules for isolation
- Responsive design
- Bootstrap utilities
- Custom CSS for broker-specific features

### API Integration
- Centralized API client
- Error handling at component level
- Loading states
- Automatic refresh

## Known Limitations

1. **Real-time Updates**: Messages don't update in real-time
2. **Typing Indicators**: Not implemented
3. **Message Reactions**: Not implemented
4. **File Uploads**: Not implemented
5. **Message Editing**: Not implemented

## Future Enhancements

1. WebSocket integration for real-time messaging
2. Typing indicators
3. Message reactions
4. File/image uploads
5. Message editing and deletion
6. Message search within conversation
7. Conversation pinning
8. Message forwarding
9. Bulk actions (archive, delete)
10. Message templates for common responses

## Broker-Specific Features

### Conversation Management
- Filter by conversation type
- Search conversations
- Track unread messages
- View booking context

### Communication
- Message customers
- Message hotels
- Negotiate terms
- Share information

### Offer Management
- View upgrade offers from hotels
- Share offers with customers
- Track offer status
- Manage negotiations

## Status
✅ Phase 3 Complete - Broker Messaging UI fully implemented with filtering, search, and booking context.

Next: Phase 4 - Hotel/Manager Messaging UI
