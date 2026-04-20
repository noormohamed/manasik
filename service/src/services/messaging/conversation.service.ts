/**
 * Conversation Service - Conversation management
 */

import { v4 as uuidv4 } from 'uuid';
import { Database } from '../../database/connection';

export interface CreateConversationInput {
  hotelId: string;
  bookingId?: string;
  subject: string;
  description?: string;
  createdById: string;
  createdByRole: 'GUEST' | 'BROKER' | 'HOTEL_STAFF' | 'MANAGER' | 'ADMIN';
  participants: Array<{
    userId: string;
    userRole: 'GUEST' | 'BROKER' | 'HOTEL_STAFF' | 'MANAGER' | 'ADMIN';
    hotelId?: string;
  }>;
}

export interface Conversation {
  id: string;
  hotelId: string;
  bookingId: string | null;
  subject: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  createdById: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  participants?: ConversationParticipant[];
  lastMessage?: any;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  userRole: string;
  hotelId: string | null;
  isRead: boolean;
  lastReadAt: string | null;
  joinedAt: string;
  leftAt: string | null;
}

export class ConversationService {
  constructor(private db: Database) {}

  /**
   * Create a new conversation
   */
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const conversationId = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // Convert to MySQL format: YYYY-MM-DD HH:mm:ss

    console.log('[ConversationService] Creating conversation:', { conversationId, hotelId: input.hotelId, createdByRole: input.createdByRole });

    // Create conversation
    const conversationQuery = `
      INSERT INTO conversations (
        id, hotel_id, booking_id, subject, description,
        created_by_id, created_by_role, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      await this.db.query(conversationQuery, [
        conversationId,
        input.hotelId,
        input.bookingId || null,
        input.subject,
        input.description || null,
        input.createdById,
        input.createdByRole,
        now,
        now,
      ]);
      console.log('[ConversationService] Conversation created successfully');
    } catch (error) {
      console.error('[ConversationService] Error creating conversation:', error);
      throw error;
    }

    // Add participants
    const participantQuery = `
      INSERT INTO conversation_participants (
        id, conversation_id, user_id, user_role, hotel_id, joined_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const participant of input.participants) {
      const participantId = uuidv4();
      console.log('[ConversationService] Adding participant:', { participantId, userId: participant.userId, userRole: participant.userRole });
      try {
        await this.db.query(participantQuery, [
          participantId,
          conversationId,
          participant.userId,
          participant.userRole,
          participant.hotelId || null,
          now,
        ]);
        console.log('[ConversationService] Participant added:', participant.userId);
      } catch (error) {
        console.error('[ConversationService] Error adding participant:', error);
        throw error;
      }
    }

    console.log('[ConversationService] Fetching conversation by ID:', conversationId);
    const conversation = await this.getConversationById(conversationId);
    console.log('[ConversationService] Conversation fetched:', { id: conversation.id, subject: conversation.subject });
    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string): Promise<Conversation> {
    const query = `
      SELECT 
        id, hotel_id as hotelId, booking_id as bookingId, subject, description,
        status, created_by_id as createdById, created_by_role as createdByRole,
        created_at as createdAt, updated_at as updatedAt
      FROM conversations
      WHERE id = ?
    `;

    const results = await this.db.query(query, [conversationId]);
    if (results.length === 0) {
      throw new Error('Conversation not found');
    }

    const conversation = results[0];

    // Get participants
    const participants = await this.getConversationParticipants(conversationId);
    conversation.participants = participants;

    // Get last message
    const lastMessageQuery = `
      SELECT id, content, sender_id as senderId, sender_role as senderRole, created_at as createdAt
      FROM messages
      WHERE conversation_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const lastMessageResults = await this.db.query(lastMessageQuery, [conversationId]);
    if (lastMessageResults.length > 0) {
      conversation.lastMessage = lastMessageResults[0];
    }

    return conversation;
  }

  /**
   * Get conversation participants
   */
  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const query = `
      SELECT 
        id, conversation_id as conversationId, user_id as userId,
        user_role as userRole, hotel_id as hotelId, is_read as isRead,
        last_read_at as lastReadAt, joined_at as joinedAt, left_at as leftAt
      FROM conversation_participants
      WHERE conversation_id = ? AND left_at IS NULL
      ORDER BY joined_at ASC
    `;

    return this.db.query(query, [conversationId]);
  }

  /**
   * Add participant to conversation
   */
  async addParticipant(
    conversationId: string,
    userId: string,
    userRole: 'GUEST' | 'BROKER' | 'HOTEL_STAFF' | 'MANAGER' | 'ADMIN',
    hotelId?: string
  ): Promise<ConversationParticipant> {
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Check if participant already exists
    const existingQuery = `
      SELECT id FROM conversation_participants
      WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
    `;
    const existing = await this.db.query(existingQuery, [conversationId, userId]);
    if (existing.length > 0) {
      throw new Error('Participant already in conversation');
    }

    const query = `
      INSERT INTO conversation_participants (
        id, conversation_id, user_id, user_role, hotel_id, joined_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [
      id,
      conversationId,
      userId,
      userRole,
      hotelId || null,
      now,
    ]);

    return this.getParticipantById(id);
  }

  /**
   * Get participant by ID
   */
  async getParticipantById(participantId: string): Promise<ConversationParticipant> {
    const query = `
      SELECT 
        id, conversation_id as conversationId, user_id as userId,
        user_role as userRole, hotel_id as hotelId, is_read as isRead,
        last_read_at as lastReadAt, joined_at as joinedAt, left_at as leftAt
      FROM conversation_participants
      WHERE id = ?
    `;

    const results = await this.db.query(query, [participantId]);
    if (results.length === 0) {
      throw new Error('Participant not found');
    }

    return results[0];
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const query = `
      UPDATE conversation_participants
      SET left_at = NOW()
      WHERE conversation_id = ? AND user_id = ?
    `;

    await this.db.query(query, [conversationId, userId]);
  }

  /**
   * Update participant read status
   */
  async updateParticipantReadStatus(
    conversationId: string,
    userId: string,
    isRead: boolean
  ): Promise<void> {
    const query = `
      UPDATE conversation_participants
      SET is_read = ?, last_read_at = NOW()
      WHERE conversation_id = ? AND user_id = ?
    `;

    await this.db.query(query, [isRead ? 1 : 0, conversationId, userId]);
  }

  /**
   * Get conversations for user
   */
  async getUserConversations(
    userId: string,
    userRole: string,
    hotelId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Conversation[]> {
    let query = `
      SELECT DISTINCT
        c.id, c.hotel_id as hotelId, c.booking_id as bookingId, c.subject, c.description,
        c.status, c.created_by_id as createdById, c.created_by_role as createdByRole,
        c.created_at as createdAt, c.updated_at as updatedAt
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ? AND cp.left_at IS NULL
    `;

    const params: any[] = [userId];

    // Filter by hotel if provided (for hotel staff/managers)
    if (hotelId && ['HOTEL_STAFF', 'MANAGER'].includes(userRole)) {
      query += ` AND c.hotel_id = ?`;
      params.push(hotelId);
    }

    query += ` ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const results = await this.db.query(query, params);

    // Enrich with participants and last message
    for (const conversation of results) {
      conversation.participants = await this.getConversationParticipants(conversation.id);

      const lastMessageQuery = `
        SELECT id, content, sender_id as senderId, sender_role as senderRole, created_at as createdAt
        FROM messages
        WHERE conversation_id = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const lastMessageResults = await this.db.query(lastMessageQuery, [conversation.id]);
      if (lastMessageResults.length > 0) {
        conversation.lastMessage = lastMessageResults[0];
      }

      // Get unread count
      const unreadQuery = `
        SELECT COUNT(*) as count
        FROM messages m
        WHERE m.conversation_id = ? 
          AND m.deleted_at IS NULL
          AND m.sender_id != ?
          AND m.id NOT IN (
            SELECT message_id FROM message_read_receipts WHERE user_id = ?
          )
      `;
      const unreadResults = await this.db.query(unreadQuery, [conversation.id, userId, userId]);
      conversation.unreadCount = unreadResults[0]?.count || 0;
    }

    return results;
  }

  /**
   * Get conversations for hotel
   */
  async getHotelConversations(
    hotelId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Conversation[]> {
    const query = `
      SELECT 
        id, hotel_id as hotelId, booking_id as bookingId, subject, description,
        status, created_by_id as createdById, created_by_role as createdByRole,
        created_at as createdAt, updated_at as updatedAt
      FROM conversations
      WHERE hotel_id = ?
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const results = await this.db.query(query, [hotelId, limit, offset]);

    // Enrich with participants and last message
    for (const conversation of results) {
      conversation.participants = await this.getConversationParticipants(conversation.id);

      const lastMessageQuery = `
        SELECT id, content, sender_id as senderId, sender_role as senderRole, created_at as createdAt
        FROM messages
        WHERE conversation_id = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const lastMessageResults = await this.db.query(lastMessageQuery, [conversation.id]);
      if (lastMessageResults.length > 0) {
        conversation.lastMessage = lastMessageResults[0];
      }
    }

    return results;
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(
    conversationId: string,
    status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED'
  ): Promise<void> {
    const query = `
      UPDATE conversations
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await this.db.query(query, [status, conversationId]);
  }

  /**
   * Search conversations
   */
  async searchConversations(
    searchTerm: string,
    hotelId?: string,
    limit: number = 50
  ): Promise<Conversation[]> {
    let query = `
      SELECT 
        id, hotel_id as hotelId, booking_id as bookingId, subject, description,
        status, created_by_id as createdById, created_by_role as createdByRole,
        created_at as createdAt, updated_at as updatedAt
      FROM conversations
      WHERE (subject LIKE ? OR description LIKE ?)
    `;

    const params: any[] = [`%${searchTerm}%`, `%${searchTerm}%`];

    if (hotelId) {
      query += ` AND hotel_id = ?`;
      params.push(hotelId);
    }

    query += ` ORDER BY updated_at DESC LIMIT ?`;
    params.push(limit);

    const results = await this.db.query(query, params);

    // Enrich with participants
    for (const conversation of results) {
      conversation.participants = await this.getConversationParticipants(conversation.id);
    }

    return results;
  }

  /**
   * Assign conversation to staff member
   */
  async assignConversation(
    conversationId: string,
    assignToId: string,
    assignById: string
  ): Promise<void> {
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Remove previous assignment
    const removeQuery = `
      UPDATE conversation_assignments
      SET unassigned_at = NOW()
      WHERE conversation_id = ? AND unassigned_at IS NULL
    `;
    await this.db.query(removeQuery, [conversationId]);

    // Create new assignment
    const query = `
      INSERT INTO conversation_assignments (
        id, conversation_id, assigned_to_id, assigned_by_id, assigned_at
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await this.db.query(query, [id, conversationId, assignToId, assignById, now]);
  }

  /**
   * Get conversation assignment
   */
  async getConversationAssignment(conversationId: string): Promise<any> {
    const query = `
      SELECT 
        id, conversation_id as conversationId, assigned_to_id as assignedToId,
        assigned_by_id as assignedById, assigned_at as assignedAt,
        unassigned_at as unassignedAt
      FROM conversation_assignments
      WHERE conversation_id = ? AND unassigned_at IS NULL
      ORDER BY assigned_at DESC
      LIMIT 1
    `;

    const results = await this.db.query(query, [conversationId]);
    return results.length > 0 ? results[0] : null;
  }
}
