# Messaging System - Quick Reference Guide

## Quick Start

### Backend Setup
```bash
# Run database migration
mysql -u booking_user -p booking_platform < service/database/migrations/014-create-messaging-tables.sql

# Start backend server
cd service
npm start
```

### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Run Tests
```bash
# Backend tests
cd service
npm test -- messaging

# Frontend tests
cd frontend
npm test -- Messaging
```

## API Endpoints

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages/conversations` | Create conversation |
| GET | `/api/messages/conversations` | List conversations |
| GET | `/api/messages/conversations/:id` | Get conversation |
| PUT | `/api/messages/conversations/:id/status` | Update status |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages/conversations/:id/messages` | Send message |
| PUT | `/api/messages/:id/read` | Mark as read |

### Participants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations/:id/participants` | Get participants |
| POST | `/api/messages/conversations/:id/participants` | Add participant |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/search` | Search conversations |

## Components

### Guest/Customer
- `MessagesPage` - Main messages page
- `ConversationThread` - View conversation
- `MessageComposer` - Send message
- `PreBookingInquiry` - Pre-booking inquiry form

### Broker
- `BrokerMessagesPage` - Broker messages page with filtering

### Hotel/Manager (Phase 4)
- `HotelMessagesPage` - Hotel messages page
- `ConversationAssignment` - Assign to staff
- `UpgradeOfferForm` - Create upgrade offer

### Admin (Phase 5)
- `AdminMessagesPage` - Admin messages page
- `MessagingAnalytics` - Analytics dashboard
- `EscalationManager` - Handle escalations

## Database Tables

### conversations
- `id` - Conversation ID
- `hotel_id` - Hotel ID
- `booking_id` - Booking ID (optional)
- `subject` - Conversation subject
- `status` - ACTIVE, ARCHIVED, CLOSED
- `created_by_id` - Creator user ID
- `created_by_role` - Creator role

### messages
- `id` - Message ID
- `conversation_id` - Conversation ID
- `sender_id` - Sender user ID
- `sender_role` - Sender role
- `content` - Original message content
- `content_sanitized` - Sanitized content
- `message_type` - TEXT, SYSTEM, UPGRADE_OFFER
- `metadata` - JSON metadata

### conversation_participants
- `id` - Participant ID
- `conversation_id` - Conversation ID
- `user_id` - User ID
- `user_role` - User role
- `is_read` - Read status
- `last_read_at` - Last read timestamp

### message_read_receipts
- `id` - Receipt ID
- `message_id` - Message ID
- `user_id` - User ID
- `read_at` - Read timestamp

## Services

### MessagingService
```typescript
createMessage(input) - Create message
getMessageById(id) - Get message
getConversationMessages(id, limit, offset) - Get messages
markMessageAsRead(id, userId) - Mark as read
getUnreadMessageCount(id, userId) - Get unread count
deleteMessage(id) - Delete message
searchMessages(id, term, limit) - Search messages
```

### ConversationService
```typescript
createConversation(input) - Create conversation
getConversationById(id) - Get conversation
getConversationParticipants(id) - Get participants
addParticipant(id, userId, role) - Add participant
removeParticipant(id, userId) - Remove participant
getUserConversations(userId, role, limit, offset) - Get user conversations
updateConversationStatus(id, status) - Update status
searchConversations(term, hotelId, limit) - Search conversations
assignConversation(id, assignToId, assignById) - Assign conversation
```

### MessagingSecurityService
```typescript
sanitizeMessage(content) - Sanitize message
hasSensitiveData(content) - Check for sensitive data
getSensitiveDataTypes(content) - Get detected types
```

## Common Tasks

### Create Conversation
```typescript
const conversation = await conversationService.createConversation({
  hotelId: 'hotel-1',
  subject: 'Room Inquiry',
  createdById: 'user-1',
  createdByRole: 'GUEST',
  participants: [
    { userId: 'user-1', userRole: 'GUEST' },
    { userId: 'staff-1', userRole: 'HOTEL_STAFF', hotelId: 'hotel-1' }
  ]
});
```

### Send Message
```typescript
const message = await messagingService.createMessage({
  conversationId: 'conv-1',
  senderId: 'user-1',
  senderRole: 'GUEST',
  content: 'Hello, I have a question'
});
```

### Get Conversations
```typescript
const conversations = await conversationService.getUserConversations(
  'user-1',
  'GUEST',
  undefined,
  50,
  0
);
```

### Mark as Read
```typescript
await messagingService.markMessageAsRead('msg-1', 'user-1');
```

## Sensitive Data Patterns

### Detected & Sanitized
- Credit/Debit card numbers → `****-****-****-9010`
- CVV/CVC codes → `[CVV REDACTED]`
- Bank account numbers → `[ACCOUNT REDACTED]`
- Routing numbers → `[ROUTING REDACTED]`
- IBAN → `[IBAN REDACTED]`
- SSN → `[SSN REDACTED]`
- Passport numbers → `[PASSPORT REDACTED]`
- Driver's license → `[LICENSE REDACTED]`

## Role-Based Access

### Guest
- View own conversations
- Send messages
- Create pre-booking inquiries
- Mark messages as read

### Broker
- View conversations for own bookings
- Filter by hotel/customer
- Send messages
- View upgrade offers

### Hotel Staff
- View hotel conversations
- Send messages
- View upgrade offers

### Manager
- View all hotel conversations
- Assign conversations to staff
- Send messages
- Create upgrade offers
- Update conversation status

### Admin
- View all conversations
- Search globally
- View analytics
- Handle escalations
- Manage users

## Testing

### Backend Unit Tests
```bash
npm test -- messaging-security.service.test.ts
npm test -- messaging.api.test.ts
```

### Frontend Component Tests
```bash
npm test -- MessagesPage.test.tsx
npm test -- ConversationThread.test.tsx
npm test -- PreBookingInquiry.test.tsx
npm test -- BrokerMessagesPage.test.tsx
```

### E2E Tests
```bash
npm run test:e2e
```

## Troubleshooting

### Messages not appearing
1. Check API endpoint is correct
2. Verify authentication token
3. Check conversation permissions
4. Review error logs

### Sensitive data not sanitized
1. Check security service is called
2. Verify regex patterns
3. Review message content
4. Check database

### Performance issues
1. Check database indexes
2. Review query performance
3. Check pagination
4. Monitor memory usage

### Authentication errors
1. Verify JWT token
2. Check token expiration
3. Verify user role
4. Check permissions

## File Structure

```
service/
├── database/
│   └── migrations/
│       └── 014-create-messaging-tables.sql
├── src/
│   ├── services/
│   │   └── messaging/
│   │       ├── security.service.ts
│   │       ├── messaging.service.ts
│   │       └── conversation.service.ts
│   ├── routes/
│   │   └── messaging.routes.ts
│   └── __tests__/
│       ├── messaging-security.service.test.ts
│       └── messaging.api.test.ts

frontend/
├── src/
│   └── components/
│       └── Messaging/
│           ├── MessagesPage.tsx
│           ├── ConversationThread.tsx
│           ├── MessageComposer.tsx
│           ├── PreBookingInquiry.tsx
│           ├── BrokerMessagesPage.tsx
│           ├── *.css
│           └── __tests__/
│               ├── MessagesPage.test.tsx
│               ├── ConversationThread.test.tsx
│               ├── PreBookingInquiry.test.tsx
│               └── BrokerMessagesPage.test.tsx
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_platform
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Performance Tips

1. **Pagination**: Use limit/offset for large datasets
2. **Caching**: Cache conversations in component state
3. **Lazy Loading**: Load messages on demand
4. **Indexing**: Ensure database indexes are created
5. **Monitoring**: Monitor API response times

## Security Tips

1. **Sanitization**: Always sanitize messages
2. **Authentication**: Verify JWT tokens
3. **Authorization**: Check user permissions
4. **Validation**: Validate all inputs
5. **Logging**: Log all actions

## Deployment

### Production Checklist
- [ ] Run database migration
- [ ] Deploy backend services
- [ ] Deploy frontend components
- [ ] Run all tests
- [ ] Verify API endpoints
- [ ] Check authentication
- [ ] Monitor performance
- [ ] Set up logging
- [ ] Configure backups
- [ ] Test disaster recovery

## Support

For issues or questions:
1. Check documentation
2. Review code comments
3. Check test files
4. Review error logs
5. Contact development team

## Version History

- **v1.0.0** - Initial release (Phases 1-3)
  - Database schema
  - Backend API
  - Guest/Customer UI
  - Broker UI
  - Security features
  - Comprehensive testing

## License

[Your License Here]

## Contributors

[Your Team Here]
