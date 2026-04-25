/**
 * Messaging Service - Core messaging logic
 */

import { v4 as uuidv4 } from 'uuid';
import { Database } from '../../database/connection';
import { messagingSecurityService } from './security.service';

export interface CreateMessageInput {
  conversationId: string;
  senderId: string;
  senderRole: 'GUEST' | 'BROKER' | 'HOTEL_STAFF' | 'MANAGER' | 'ADMIN';
  content: string;
  messageType?: 'TEXT' | 'SYSTEM' | 'UPGRADE_OFFER';
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  senderName?: string;
  senderHotelName?: string;
  content: string;
  contentSanitized: string;
  messageType: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  readBy?: string[];
  isRead?: boolean;
}

export interface MessageWithReadStatus extends Message {
  readCount: number;
  totalParticipants: number;
}

export class MessagingService {
  constructor(private db: Database) {}

  /**
   * Create a new message
   */
  async createMessage(input: CreateMessageInput): Promise<Message> {
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Sanitize message content
    const sanitizationResult = messagingSecurityService.sanitizeMessage(input.content);

    const query = `
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_role, content, 
        content_sanitized, message_type, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [
      id,
      input.conversationId,
      input.senderId,
      input.senderRole,
      input.content,
      sanitizationResult.sanitized,
      input.messageType || 'TEXT',
      input.metadata ? JSON.stringify(input.metadata) : null,
      now,
      now,
    ]);

    return this.getMessageById(id);
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<Message> {
    const query = `
      SELECT 
        m.id, m.conversation_id as conversationId, m.sender_id as senderId,
        m.sender_role as senderRole, m.content, m.content_sanitized as contentSanitized,
        m.message_type as messageType, m.metadata, m.created_at as createdAt,
        m.updated_at as updatedAt, m.deleted_at as deletedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName, h.name as senderHotelName
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id AND m.sender_id = cp.user_id
      LEFT JOIN hotels h ON cp.hotel_id = h.id
      WHERE m.id = ? AND m.deleted_at IS NULL
    `;

    const results = await this.db.query(query, [messageId]);
    if (results.length === 0) {
      throw new Error('Message not found');
    }

    const message = results[0];
    return {
      ...message,
      metadata: message.metadata ? JSON.parse(message.metadata) : null,
    };
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const query = `
      SELECT 
        m.id, m.conversation_id as conversationId, m.sender_id as senderId,
        m.sender_role as senderRole, m.content, m.content_sanitized as contentSanitized,
        m.message_type as messageType, m.metadata, m.created_at as createdAt,
        m.updated_at as updatedAt, m.deleted_at as deletedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName, h.name as senderHotelName
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id AND m.sender_id = cp.user_id
      LEFT JOIN hotels h ON cp.hotel_id = h.id
      WHERE m.conversation_id = ? AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const results = await this.db.query(query, [conversationId]);
    return results.map((msg: any) => ({
      ...msg,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
    }));
  }

  /**
   * Mark message as read by user
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      INSERT INTO message_read_receipts (id, message_id, user_id, read_at)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE read_at = ?
    `;

    await this.db.query(query, [id, messageId, userId, now, now]);
  }

  /**
   * Get read receipts for a message
   */
  async getMessageReadReceipts(messageId: string): Promise<Array<{ userId: string; readAt: string }>> {
    const query = `
      SELECT user_id as userId, read_at as readAt
      FROM message_read_receipts
      WHERE message_id = ?
      ORDER BY read_at ASC
    `;

    return this.db.query(query, [messageId]);
  }

  /**
   * Get unread message count for user in conversation
   */
  async getUnreadMessageCount(conversationId: string, userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM messages m
      WHERE m.conversation_id = ? 
        AND m.deleted_at IS NULL
        AND m.sender_id != ?
        AND m.id NOT IN (
          SELECT message_id FROM message_read_receipts WHERE user_id = ?
        )
    `;

    const results = await this.db.query(query, [conversationId, userId, userId]);
    return results[0]?.count || 0;
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const query = `
      INSERT INTO message_read_receipts (id, message_id, user_id, read_at)
      SELECT UUID(), m.id, ?, NOW()
      FROM messages m
      WHERE m.conversation_id = ? 
        AND m.deleted_at IS NULL
        AND m.sender_id != ?
        AND m.id NOT IN (
          SELECT message_id FROM message_read_receipts WHERE user_id = ?
        )
      ON DUPLICATE KEY UPDATE read_at = NOW()
    `;

    await this.db.query(query, [userId, conversationId, userId, userId]);
  }

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    const query = `
      UPDATE messages
      SET deleted_at = NOW()
      WHERE id = ?
    `;

    await this.db.query(query, [messageId]);
  }

  /**
   * Get message with read status
   */
  async getMessageWithReadStatus(messageId: string, userId: string): Promise<MessageWithReadStatus> {
    const message = await this.getMessageById(messageId);
    const receipts = await this.getMessageReadReceipts(messageId);

    // Get total participants in conversation
    const participantQuery = `
      SELECT COUNT(*) as count
      FROM conversation_participants
      WHERE conversation_id = ? AND left_at IS NULL
    `;
    const participantResults = await this.db.query(participantQuery, [message.conversationId]);
    const totalParticipants = participantResults[0]?.count || 0;

    return {
      ...message,
      readCount: receipts.length,
      totalParticipants,
    };
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(
    conversationId: string,
    searchTerm: string,
    limit: number = 50
  ): Promise<Message[]> {
    const query = `
      SELECT 
        m.id, m.conversation_id as conversationId, m.sender_id as senderId,
        m.sender_role as senderRole, m.content, m.content_sanitized as contentSanitized,
        m.message_type as messageType, m.metadata, m.created_at as createdAt,
        m.updated_at as updatedAt, m.deleted_at as deletedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName, h.name as senderHotelName
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id AND m.sender_id = cp.user_id
      LEFT JOIN hotels h ON cp.hotel_id = h.id
      WHERE m.conversation_id = ? 
        AND m.deleted_at IS NULL
        AND (m.content LIKE ? OR m.content_sanitized LIKE ?)
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `;

    const searchPattern = `%${searchTerm}%`;
    const results = await this.db.query(query, [
      conversationId,
      searchPattern,
      searchPattern,
    ]);

    return results.map((msg: any) => ({
      ...msg,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
    }));
  }

  /**
   * Get messages with sensitive data for audit
   */
  async getMessagesWithSensitiveData(conversationId: string): Promise<Message[]> {
    const query = `
      SELECT 
        m.id, m.conversation_id as conversationId, m.sender_id as senderId,
        m.sender_role as senderRole, m.content, m.content_sanitized as contentSanitized,
        m.message_type as messageType, m.metadata, m.created_at as createdAt,
        m.updated_at as updatedAt, m.deleted_at as deletedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName, h.name as senderHotelName
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id AND m.sender_id = cp.user_id
      LEFT JOIN hotels h ON cp.hotel_id = h.id
      WHERE m.conversation_id = ? 
        AND m.deleted_at IS NULL
        AND m.content != m.content_sanitized
      ORDER BY m.created_at DESC
    `;

    const results = await this.db.query(query, [conversationId]);
    return results.map((msg: any) => ({
      ...msg,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
    }));
  }
}
