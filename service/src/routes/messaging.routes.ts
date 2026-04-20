/**
 * Messaging Routes - API endpoints for messaging system
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware';
import { Database } from '../database/connection';
import { ConversationService } from '../services/messaging/conversation.service';
import { MessagingService } from '../services/messaging/messaging.service';
import { messagingSecurityService } from '../services/messaging/security.service';
import { v4 as uuidv4 } from 'uuid';

let conversationService: ConversationService;
let messagingService: MessagingService;

export function initializeMessagingRoutes(db: Database) {
  conversationService = new ConversationService(db);
  messagingService = new MessagingService(db);
}

export const createMessagingRouter = () => {
  const router = new Router({ prefix: '/messages' });

  // Require authentication for all messaging routes
  router.use(authMiddleware);

  /**
   * POST /api/messages/conversations
   * Create a new conversation
   */
  router.post('/conversations', async (ctx: AuthContext) => {
    try {
      const { hotelId, bookingId, subject, description, participants } = ctx.request.body as any;

      if (!hotelId || !subject) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'hotelId and subject are required',
        };
        return;
      }

      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'At least one participant is required',
        };
        return;
      }

      // Ensure creator is included as participant
      const allParticipants = participants;
      const creatorExists = allParticipants.some((p: any) => p.userId === ctx.user?.userId);
      if (!creatorExists) {
        allParticipants.push({
          userId: ctx.user?.userId,
          userRole: ctx.user?.role,
        });
      }

      const conversation = await conversationService.createConversation({
        hotelId,
        bookingId,
        subject,
        description,
        createdById: ctx.user!.userId,
        createdByRole: ctx.user!.role as any,
        participants: allParticipants,
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: conversation,
      };
    } catch (error: any) {
      console.error('[Messaging] Create conversation error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to create conversation',
      };
    }
  });

  /**
   * GET /api/messages/conversations
   * List conversations for user
   */
  router.get('/conversations', async (ctx: AuthContext) => {
    try {
      const limit = Math.min(parseInt(ctx.query.limit as string) || 50, 100);
      const offset = parseInt(ctx.query.offset as string) || 0;
      const hotelId = ctx.query.hotelId as string;

      const conversations = await conversationService.getUserConversations(
        ctx.user!.userId,
        ctx.user!.role,
        hotelId,
        limit,
        offset
      );

      ctx.body = {
        success: true,
        data: conversations,
        pagination: {
          limit,
          offset,
          total: conversations.length,
        },
      };
    } catch (error: any) {
      console.error('[Messaging] List conversations error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to list conversations',
      };
    }
  });

  /**
   * GET /api/messages/conversations/:id
   * Get conversation with messages
   */
  router.get('/conversations/:id', async (ctx: AuthContext) => {
    try {
      const conversationId = ctx.params.id;
      const limit = Math.min(parseInt(ctx.query.limit as string) || 50, 100);
      const offset = parseInt(ctx.query.offset as string) || 0;

      const conversation = await conversationService.getConversationById(conversationId);

      // Check if user is participant
      const isParticipant = conversation.participants?.some(
        (p: any) => p.userId === ctx.user?.userId
      );

      if (!isParticipant) {
        ctx.status = 403;
        ctx.body = {
          success: false,
          error: 'You do not have access to this conversation',
        };
        return;
      }

      // Get messages
      const messages = await messagingService.getConversationMessages(
        conversationId,
        limit,
        offset
      );

      // Mark conversation as read
      await conversationService.updateParticipantReadStatus(
        conversationId,
        ctx.user!.userId,
        true
      );

      ctx.body = {
        success: true,
        data: {
          conversation,
          messages,
          pagination: {
            limit,
            offset,
            total: messages.length,
          },
        },
      };
    } catch (error: any) {
      console.error('[Messaging] Get conversation error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to get conversation',
      };
    }
  });

  /**
   * POST /api/messages/conversations/:id/messages
   * Send message in conversation
   */
  router.post('/conversations/:id/messages', async (ctx: AuthContext) => {
    try {
      const conversationId = ctx.params.id;
      const { content, messageType, metadata } = ctx.request.body as any;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Message content is required',
        };
        return;
      }

      // Check if user is participant
      const conversation = await conversationService.getConversationById(conversationId);
      const isParticipant = conversation.participants?.some(
        (p: any) => p.userId === ctx.user?.userId
      );

      if (!isParticipant) {
        ctx.status = 403;
        ctx.body = {
          success: false,
          error: 'You do not have access to this conversation',
        };
        return;
      }

      // Create message
      const message = await messagingService.createMessage({
        conversationId,
        senderId: ctx.user!.userId,
        senderRole: ctx.user!.role as any,
        content,
        messageType: messageType || 'TEXT',
        metadata,
      });

      // Log audit
      await logMessageAudit(conversationId, message.id, ctx.user!.userId, 'MESSAGE_SENT', {
        hasSensitiveData: messagingSecurityService.hasSensitiveData(content),
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: message,
      };
    } catch (error: any) {
      console.error('[Messaging] Send message error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  });

  /**
   * PUT /api/messages/:id/read
   * Mark message as read
   */
  router.put('/messages/:id/read', async (ctx: AuthContext) => {
    try {
      const messageId = ctx.params.id;

      await messagingService.markMessageAsRead(messageId, ctx.user!.userId);

      // Log audit
      await logMessageAudit(null, messageId, ctx.user!.userId, 'MESSAGE_READ', {});

      ctx.body = {
        success: true,
        message: 'Message marked as read',
      };
    } catch (error: any) {
      console.error('[Messaging] Mark as read error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to mark message as read',
      };
    }
  });

  /**
   * GET /api/messages/conversations/:id/participants
   * Get conversation participants
   */
  router.get('/conversations/:id/participants', async (ctx: AuthContext) => {
    try {
      const conversationId = ctx.params.id;

      // Check if user is participant
      const conversation = await conversationService.getConversationById(conversationId);
      const isParticipant = conversation.participants?.some(
        (p: any) => p.userId === ctx.user?.userId
      );

      if (!isParticipant) {
        ctx.status = 403;
        ctx.body = {
          success: false,
          error: 'You do not have access to this conversation',
        };
        return;
      }

      const participants = await conversationService.getConversationParticipants(conversationId);

      ctx.body = {
        success: true,
        data: participants,
      };
    } catch (error: any) {
      console.error('[Messaging] Get participants error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to get participants',
      };
    }
  });

  /**
   * POST /api/messages/conversations/:id/participants
   * Add participant to conversation
   */
  router.post('/conversations/:id/participants', async (ctx: AuthContext) => {
    try {
      const conversationId = ctx.params.id;
      const { userId, userRole, hotelId } = ctx.request.body as any;

      if (!userId || !userRole) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'userId and userRole are required',
        };
        return;
      }

      // Check if user is manager/admin
      if (!['MANAGER', 'ADMIN'].includes(ctx.user!.role)) {
        ctx.status = 403;
        ctx.body = {
          success: false,
          error: 'Only managers and admins can add participants',
        };
        return;
      }

      const participant = await conversationService.addParticipant(
        conversationId,
        userId,
        userRole as any,
        hotelId
      );

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: participant,
      };
    } catch (error: any) {
      console.error('[Messaging] Add participant error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to add participant',
      };
    }
  });

  /**
   * PUT /api/messages/conversations/:id/status
   * Update conversation status
   */
  router.put('/conversations/:id/status', async (ctx: AuthContext) => {
    try {
      const conversationId = ctx.params.id;
      const { status } = ctx.request.body as any;

      if (!['ACTIVE', 'ARCHIVED', 'CLOSED'].includes(status)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid status',
        };
        return;
      }

      // Check if user is manager/admin
      if (!['MANAGER', 'ADMIN'].includes(ctx.user!.role)) {
        ctx.status = 403;
        ctx.body = {
          success: false,
          error: 'Only managers and admins can update conversation status',
        };
        return;
      }

      await conversationService.updateConversationStatus(conversationId, status);

      // Log audit
      await logMessageAudit(conversationId, null, ctx.user!.userId, 'CONVERSATION_STATUS_UPDATED', {
        status,
      });

      ctx.body = {
        success: true,
        message: 'Conversation status updated',
      };
    } catch (error: any) {
      console.error('[Messaging] Update status error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to update conversation status',
      };
    }
  });

  /**
   * GET /api/messages/search
   * Search conversations and messages
   */
  router.get('/search', async (ctx: AuthContext) => {
    try {
      const searchTerm = ctx.query.q as string;
      const hotelId = ctx.query.hotelId as string;

      if (!searchTerm || searchTerm.length < 2) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Search term must be at least 2 characters',
        };
        return;
      }

      const conversations = await conversationService.searchConversations(
        searchTerm,
        hotelId,
        50
      );

      ctx.body = {
        success: true,
        data: conversations,
      };
    } catch (error: any) {
      console.error('[Messaging] Search error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message || 'Failed to search',
      };
    }
  });

  return router;
};

/**
 * Helper function to log message audit
 */
async function logMessageAudit(
  conversationId: string | null,
  messageId: string | null,
  userId: string,
  action: string,
  details: Record<string, any>
) {
  try {
    // This would be implemented with the database connection
    // For now, just log to console
    console.log('[Audit]', {
      conversationId,
      messageId,
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Audit] Failed to log:', error);
  }
}
