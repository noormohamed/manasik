# Messaging System - Phase 1: Database & Backend API

## Overview
Phase 1 implements the complete database schema and backend API for a unified messaging system that works across all user roles (Guest, Broker, Hotel Staff, Manager, Admin) with a single shared UI.

## What Was Implemented

### 1. Database Migrations
Created `service/database/migrations/014-create-messaging-tables.sql` with the following tables:

#### conversations
- Stores conversation metadata
- Links hotel, booking, and participants
- Tracks conversation status (ACTIVE, ARCHIVED, CLOSED)
- Indexes for efficient querying by hotel, booking, status, and creation date

#### conversation_participants
- Tracks who is in each conversation
- Stores read status and last read timestamp
- Tracks when participants joined/left
- Unique constraint to prevent duplicate participants

#### messages
- Stores individual messages
- Includes both original and sanitized content
- Supports different message types (TEXT, SYSTEM, UPGRADE_OFFER)
- Stores metadata as JSON for extensibility
- Soft delete support (deleted_at field)

#### message_read_receipts
- Tracks which users have read which messages
- Stores read timestamp
- Unique constraint to prevent duplicate receipts

#### conversation_assignments
- Allows managers to assign conversations to staff members
- Tracks who assigned it and when
- Supports unassignment

#### message_audit_log
- Comprehensive audit trail for all messaging actions
- Stores action type, details, and IP address
- Enables compliance and security monitoring

### 2. Security Service
Created `service/src/services/messaging/security.service.ts`

**Features:**
- Detects and sanitizes sensitive data patterns:
  - Credit/Debit card numbers (masks to show only last 4 digits)
  - CVV/CVC codes
  - Bank account numbers
  - Routing numbers
  - IBAN (International Bank Account Numbers)
  - Social Security Numbers (SSN)
  - Passport numbers
  - Driver's license numbers
  - Phone numbers and emails

**Methods:**
- `sanitizeMessage()` - Sanitizes content and returns sanitization result
- `hasSensitiveData()` - Checks if content contains sensitive data
- `getSensitiveDataTypes()` - Returns list of detected sensitive data types

**Security Approach:**
- All messages are automatically sanitized before storage
- Original content is preserved for audit purposes
- Sanitized content is used for display
- Sensitive data detection is logged for compliance

### 3. Messaging Service
Created `service/src/services/messaging/messaging.service.ts`

**Core Methods:**
- `createMessage()` - Create new message with automatic sanitization
- `getMessageById()` - Retrieve message by ID
- `getConversationMessages()` - Get paginated messages for conversation
- `markMessageAsRead()` - Mark message as read by user
- `getMessageReadReceipts()` - Get read status for message
- `getUnreadMessageCount()` - Get unread count for user in conversation
- `markConversationAsRead()` - Mark all messages in conversation as read
- `deleteMessage()` - Soft delete message
- `getMessageWithReadStatus()` - Get message with read count and total participants
- `searchMessages()` - Search messages in conversation
- `getMessagesWithSensitiveData()` - Get messages with sensitive data for audit

**Features:**
- Automatic message sanitization
- Read receipt tracking
- Unread message counting
- Message search
- Soft delete support
- Metadata support for extensibility

### 4. Conversation Service
Created `service/src/services/messaging/conversation.service.ts`

**Core Methods:**
- `createConversation()` - Create new conversation with participants
- `getConversationById()` - Get conversation with participants and last message
- `getConversationParticipants()` - Get active participants
- `addParticipant()` - Add new participant to conversation
- `removeParticipant()` - Remove participant (soft delete)
- `updateParticipantReadStatus()` - Update read status
- `getUserConversations()` - Get conversations for user (role-aware filtering)
- `getHotelConversations()` - Get all conversations for hotel
- `updateConversationStatus()` - Update conversation status
- `searchConversations()` - Search conversations by subject/description
- `assignConversation()` - Assign conversation to staff member
- `getConversationAssignment()` - Get current assignment

**Features:**
- Role-aware conversation filtering
- Participant management
- Read status tracking
- Conversation assignment for hotel staff
- Search functionality
- Soft delete for participants

### 5. Messaging API Routes
Created `service/src/routes/messaging.routes.ts`

**Endpoints:**

#### Conversation Management
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/conversations` - List user's conversations
- `GET /api/messages/conversations/:id` - Get conversation with messages
- `PUT /api/messages/conversations/:id/status` - Update conversation status (manager/admin only)
- `GET /api/messages/conversations/:id/participants` - Get participants
- `POST /api/messages/conversations/:id/participants` - Add participant (manager/admin only)

#### Messaging
- `POST /api/messages/conversations/:id/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `GET /api/messages/search` - Search conversations and messages

**Security Features:**
- All endpoints require authentication
- Role-based access control
- Participant verification before allowing message send/read
- Manager/admin-only operations for status updates and participant management
- Automatic message sanitization
- Audit logging for all actions

### 6. Comprehensive Tests
Created test files with full coverage:

#### `service/src/__tests__/messaging-security.service.test.ts`
- Tests for all sensitive data detection patterns
- Tests for sanitization accuracy
- Edge case testing (multiple card numbers, various formats)
- Tests for null/empty content handling

#### `service/src/__tests__/messaging.api.test.ts`
- Tests for all API endpoints
- Authentication and authorization tests
- Permission tests for different roles
- Security tests for sensitive data sanitization
- Pagination tests
- Error handling tests
- Input validation tests

## API Usage Examples

### Create a Conversation
```bash
curl -X POST http://localhost:3001/api/messages/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "hotel-123",
    "bookingId": "booking-456",
    "subject": "Room Inquiry",
    "description": "I have questions about room availability",
    "participants": [
      { "userId": "guest-1", "userRole": "GUEST" },
      { "userId": "staff-1", "userRole": "HOTEL_STAFF", "hotelId": "hotel-123" }
    ]
  }'
```

### Send a Message
```bash
curl -X POST http://localhost:3001/api/messages/conversations/conv-123/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I would like to book a room for 3 nights",
    "messageType": "TEXT"
  }'
```

### Get Conversations
```bash
curl -X GET "http://localhost:3001/api/messages/conversations?limit=50&offset=0" \
  -H "Authorization: Bearer <token>"
```

### Get Conversation with Messages
```bash
curl -X GET "http://localhost:3001/api/messages/conversations/conv-123?limit=50&offset=0" \
  -H "Authorization: Bearer <token>"
```

### Mark Message as Read
```bash
curl -X PUT http://localhost:3001/api/messages/msg-123/read \
  -H "Authorization: Bearer <token>"
```

## Security Implementation

### Sensitive Data Sanitization
All messages are automatically scanned for sensitive information:
- Card numbers are masked (e.g., `****-****-****-9010`)
- CVV/CVC codes are replaced with `[CVV REDACTED]`
- Bank account numbers are replaced with `[ACCOUNT REDACTED]`
- SSN is replaced with `[SSN REDACTED]`
- Other sensitive data is similarly redacted

### Access Control
- **Guests**: Can only see their own conversations
- **Brokers**: Can see conversations for bookings they created
- **Hotel Staff**: Can see conversations for their hotel
- **Managers**: Can see all conversations for their hotel and manage staff assignments
- **Admins**: Can see all conversations across the platform

### Audit Trail
All messaging actions are logged:
- Message creation
- Message reads
- Conversation status changes
- Participant additions/removals
- Conversation assignments

## Database Setup

### Run Migration
```bash
# The migration will be run automatically when the service starts
# Or manually:
mysql -u booking_user -p booking_platform < service/database/migrations/014-create-messaging-tables.sql
```

## Running Tests

### Unit Tests
```bash
cd service
npm test -- messaging-security.service.test.ts
```

### API Tests
```bash
cd service
npm test -- messaging.api.test.ts
```

### All Tests
```bash
cd service
npm test
```

## Next Steps

Phase 2 will implement the Guest/Customer Messaging UI with React components for:
- Messages page
- Conversation list
- Conversation thread view
- Message composer
- Pre-booking inquiry form

## Architecture Notes

### Design Principles
1. **Single Unified UI**: All user types use the same components with role-based visibility
2. **Security First**: Sensitive data is automatically sanitized
3. **Audit Trail**: All actions are logged for compliance
4. **Scalability**: Proper indexing and pagination for large datasets
5. **Extensibility**: Metadata fields for future enhancements

### Database Design
- Proper normalization with foreign keys
- Efficient indexing for common queries
- Soft deletes for data preservation
- JSON metadata for flexibility
- Audit logging for compliance

### API Design
- RESTful endpoints
- Consistent error responses
- Pagination support
- Role-based access control
- Comprehensive validation

## Files Created

### Database
- `service/database/migrations/014-create-messaging-tables.sql`

### Services
- `service/src/services/messaging/security.service.ts`
- `service/src/services/messaging/messaging.service.ts`
- `service/src/services/messaging/conversation.service.ts`

### Routes
- `service/src/routes/messaging.routes.ts`

### Tests
- `service/src/__tests__/messaging-security.service.test.ts`
- `service/src/__tests__/messaging.api.test.ts`

### Configuration
- Updated `service/src/routes/api.routes.ts` to include messaging routes

## Status
✅ Phase 1 Complete - Database schema, backend services, API routes, and comprehensive tests implemented.

Next: Phase 2 - Guest/Customer Messaging UI
