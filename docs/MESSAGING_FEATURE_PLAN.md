# Messaging Feature Plan - Complete Architecture

## Overview
A comprehensive messaging system that connects Guests, Hotels, Brokers, Managers, and Admin staff around bookings and hotel inquiries.

## User Roles & Access

### 1. **Guests/Customers**
- Message hotels before booking (pre-booking inquiries)
- Message hotels after booking (support, upgrades)
- View conversations tied to their bookings
- Receive messages from hotels and brokers

### 2. **Brokers** (NEW)
- Create bookings on behalf of customers
- Message hotels about bookings they created
- Message customers about their bookings
- Track all bookings they've created
- Receive upgrade offers from hotels

### 3. **Hotel Staff**
- Receive messages from guests and brokers
- Send messages to guests and brokers
- Send upgrade offers to guests/brokers
- Manage conversations per hotel

### 4. **Hotel Managers**
- Oversee all hotel conversations
- Assign conversations to staff
- View conversation analytics

### 5. **Admin/Management**
- View all conversations across platform
- Monitor messaging activity
- Handle escalations

## Database Schema

### New Tables

#### `conversations`
```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(36),  -- NULL for pre-booking inquiries
  created_by_id VARCHAR(36) NOT NULL,  -- Guest, Broker, or Hotel staff
  created_by_type ENUM('GUEST', 'BROKER', 'HOTEL_STAFF') NOT NULL,
  status ENUM('ACTIVE', 'ARCHIVED', 'CLOSED') DEFAULT 'ACTIVE',
  subject VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_created_by (created_by_id),
  INDEX idx_status (status)
);
```

#### `conversation_participants`
```sql
CREATE TABLE conversation_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  participant_type ENUM('GUEST', 'BROKER', 'HOTEL_STAFF', 'MANAGER', 'ADMIN') NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (conversation_id, user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_last_read (last_read_at)
);
```

#### `messages`
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  sender_type ENUM('GUEST', 'BROKER', 'HOTEL_STAFF', 'MANAGER', 'ADMIN') NOT NULL,
  content TEXT NOT NULL,
  message_type ENUM('TEXT', 'UPGRADE_OFFER', 'SYSTEM') DEFAULT 'TEXT',
  metadata JSON,  -- For upgrade offers, system messages, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);
```

#### `message_read_receipts`
```sql
CREATE TABLE message_read_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_read_receipt (message_id, user_id),
  INDEX idx_user_id (user_id)
);
```

## Backend API Endpoints

### Conversation Management
- `GET /api/messages/conversations` - List conversations for user
- `POST /api/messages/conversations` - Create new conversation
- `GET /api/messages/conversations/:id` - Get conversation details
- `PUT /api/messages/conversations/:id` - Update conversation (archive, close)

### Messaging
- `GET /api/messages/conversations/:id/messages` - Get messages in conversation
- `POST /api/messages/conversations/:id/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `PUT /api/messages/:id` - Edit message (if allowed)

### Broker-Specific
- `GET /api/broker/conversations` - List conversations for broker's bookings
- `GET /api/broker/bookings/:id/conversations` - Get conversation for specific booking
- `POST /api/broker/bookings/:id/messages` - Send message about booking

### Hotel/Manager
- `GET /api/hotel/:id/conversations` - List all conversations for hotel
- `GET /api/hotel/:id/conversations/unread` - Get unread conversation count
- `POST /api/hotel/:id/conversations/:convId/assign` - Assign to staff member

### Admin
- `GET /api/admin/messages/conversations` - List all conversations
- `GET /api/admin/messages/analytics` - Messaging analytics

## Frontend Implementation

### Phase 1: Guest/Customer Messaging
- **Location**: Dashboard → Messages tab
- **Components**:
  - Conversation list (similar to My Bookings layout)
  - Conversation thread view
  - Message composer
  - Pre-booking inquiry form

### Phase 2: Broker Messaging
- **Location**: Broker dashboard → Messages tab
- **Components**:
  - Conversations for bookings created by broker
  - Message thread with hotel and customer
  - Upgrade offer display

### Phase 3: Hotel/Manager Messaging
- **Location**: Management panel → Messages section
- **Components**:
  - Conversation queue
  - Message thread
  - Staff assignment
  - Upgrade offer templates

### Phase 4: Admin Messaging
- **Location**: Super admin panel → Messages section
- **Components**:
  - Global conversation view
  - Analytics dashboard
  - Escalation management

## Implementation Phases

### Phase 1: Database & Backend API
- Create database tables
- Implement conversation service
- Implement message service
- Create API endpoints
- Add authentication/authorization

### Phase 2: Guest Messaging UI
- Add Messages tab to dashboard
- Create conversation list component
- Create message thread component
- Implement message composer
- Add pre-booking inquiry form

### Phase 3: Broker Messaging UI
- Add Messages to broker dashboard
- Link to bookings created by broker
- Enable broker-to-hotel messaging
- Enable broker-to-customer messaging

### Phase 4: Hotel/Manager Messaging UI
- Add Messages to management panel
- Create conversation queue
- Implement staff assignment
- Add upgrade offer templates

### Phase 5: Admin Messaging UI
- Add Messages to super admin panel
- Create analytics dashboard
- Implement escalation handling

## Key Features

### Conversation Types
1. **Pre-booking Inquiry**: Guest → Hotel (no booking yet)
2. **Post-booking Support**: Guest/Broker → Hotel (tied to booking)
3. **Upgrade Offers**: Hotel → Guest/Broker (special message type)
4. **Broker Management**: Broker ↔ Hotel ↔ Guest (triangular)

### Message Types
- **TEXT**: Regular messages
- **UPGRADE_OFFER**: Special formatted offer
- **SYSTEM**: Automated messages (booking confirmed, etc.)

### Permissions
- Guests can only see their own conversations
- Brokers can see conversations for bookings they created
- Hotel staff can see conversations for their hotel
- Managers can see all conversations for their hotel
- Admins can see all conversations

### Notifications
- New message notifications
- Unread message count
- Email notifications (optional)

## Security Considerations
- Validate user access to conversations
- Sanitize message content
- Rate limiting on message creation
- Audit trail for all messages
- Encryption for sensitive data (optional)

## Success Metrics
- Message delivery time
- Conversation resolution time
- User engagement (messages per booking)
- Broker utilization
- Customer satisfaction

## Timeline Estimate
- Phase 1: 2-3 days
- Phase 2: 2-3 days
- Phase 3: 1-2 days
- Phase 4: 2-3 days
- Phase 5: 1-2 days
- **Total: 8-13 days**
