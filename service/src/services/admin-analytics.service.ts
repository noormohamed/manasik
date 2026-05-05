/**
 * Admin Analytics Service
 * Aggregates dashboard data from bookings, payments, reviews, users, and companies tables.
 */

import { Database } from '../database/connection';

export interface AnalyticsQuery {
  range: 7 | 30 | 90;
}

export interface AnalyticsResponse {
  revenue: {
    total: number;
    average: number;
    trend: number;
    daily: Array<{ date: string; amount: number }>;
    byHotel: Array<{ hotelId: string; hotelName: string; revenue: number }>;
    bySource: Array<{ source: string; revenue: number }>;
    brokerFees: number;
  };
  bookings: {
    total: number;
    conversionRate: number;
    averageStayDuration: number;
    averageLeadTime: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    dailyVolume: Array<{ date: string; confirmed: number; completed: number; expired: number }>;
    byPaymentStatus: Record<string, number>;
    expiredRate: number;
  };
  hotels: {
    performance: Array<{
      hotelId: string;
      hotelName: string;
      totalBookings: number;
      totalRevenue: number;
      averageRating: number;
      totalReviews: number;
    }>;
    zeroBookingCount: number;
  };
  reviews: {
    ratingDistribution: Record<number, number>;
    averageRating: number;
  };
  users: {
    byRole: Record<string, number>;
    totalCount: number;
    topAgents: Array<{ agentId: string; agentName: string; revenue: number }>;
  };
  meta: {
    generatedAt: string;
    range: number;
    periodStart: string;
    periodEnd: string;
  };
}

export class AnalyticsService {
  constructor(private database: Database) {}

  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsResponse> {
    const range = [7, 30, 90].includes(query.range) ? query.range : 30;

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodEnd.getDate() - range);

    const previousPeriodEnd = new Date(periodStart);
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodEnd.getDate() - range);

    const periodStartStr = periodStart.toISOString().slice(0, 10);
    const periodEndStr = periodEnd.toISOString().slice(0, 10);
    const prevPeriodStartStr = previousPeriodStart.toISOString().slice(0, 10);
    const prevPeriodEndStr = previousPeriodEnd.toISOString().slice(0, 10);

    const [
      revenueResult,
      previousRevenueResult,
      dailyRevenueResult,
      topHotelsByRevenueResult,
      revenueBySourceResult,
      brokerFeesResult,
      bookingTotalResult,
      bookingsByStatusResult,
      bookingsBySourceResult,
      dailyVolumeResult,
      bookingsByPaymentStatusResult,
      stayDurationResult,
      leadTimeResult,
      hotelPerformanceResult,
      zeroBookingCountResult,
      ratingDistributionResult,
      averageRatingResult,
      usersByRoleResult,
      userTotalResult,
      topAgentsResult,
    ] = await Promise.all([
      // 1. Revenue total for current period (CONFIRMED + COMPLETED)
      this.database.query(
        `SELECT COALESCE(SUM(total), 0) as totalRevenue, COUNT(*) as activeCount
         FROM bookings
         WHERE status IN ('CONFIRMED', 'COMPLETED')
           AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)`,
        [periodStartStr, periodEndStr]
      ),

      // 2. Revenue total for previous period (for trend)
      this.database.query(
        `SELECT COALESCE(SUM(total), 0) as totalRevenue
         FROM bookings
         WHERE status IN ('CONFIRMED', 'COMPLETED')
           AND created_at >= ? AND created_at < ?`,
        [prevPeriodStartStr, prevPeriodEndStr]
      ),

      // 3. Daily revenue totals
      this.database.query(
        `SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as amount
         FROM bookings
         WHERE status IN ('CONFIRMED', 'COMPLETED')
           AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [periodStartStr, periodEndStr]
      ),

      // 4. Top 10 hotels by revenue
      this.database.query(
        `SELECT 
           h.id as hotelId,
           h.name as hotelName,
           COALESCE(SUM(b.total), 0) as revenue
         FROM bookings b
         JOIN hotels h ON JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) = h.id
         WHERE b.status IN ('CONFIRMED', 'COMPLETED')
           AND b.created_at >= ? AND b.created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY h.id, h.name
         HAVING revenue > 0
         ORDER BY revenue DESC
         LIMIT 10`,
        [periodStartStr, periodEndStr]
      ),

      // 5. Revenue by booking source
      this.database.query(
        `SELECT booking_source as source, COALESCE(SUM(total), 0) as revenue
         FROM bookings
         WHERE status IN ('CONFIRMED', 'COMPLETED')
           AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY booking_source`,
        [periodStartStr, periodEndStr]
      ),

      // 6. Broker fees
      this.database.query(
        `SELECT COALESCE(SUM(broker_fee), 0) as totalBrokerFees
         FROM bookings
         WHERE status IN ('CONFIRMED', 'COMPLETED')
           AND booking_source = 'BROKER'
           AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)`,
        [periodStartStr, periodEndStr]
      ),

      // 7. Total bookings in period
      this.database.query(
        `SELECT COUNT(*) as total
         FROM bookings
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)`,
        [periodStartStr, periodEndStr]
      ),

      // 8. Bookings by status
      this.database.query(
        `SELECT status, COUNT(*) as count
         FROM bookings
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY status`,
        [periodStartStr, periodEndStr]
      ),

      // 9. Bookings by source
      this.database.query(
        `SELECT booking_source as source, COUNT(*) as count
         FROM bookings
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY booking_source`,
        [periodStartStr, periodEndStr]
      ),

      // 10. Daily volume by status (CONFIRMED, COMPLETED, EXPIRED)
      this.database.query(
        `SELECT 
           DATE(created_at) as date,
           SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
           SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired
         FROM bookings
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [periodStartStr, periodEndStr]
      ),

      // 11. Bookings by payment status
      this.database.query(
        `SELECT payment_status as paymentStatus, COUNT(*) as count
         FROM bookings
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY payment_status`,
        [periodStartStr, periodEndStr]
      ),

      // 12. Average stay duration (from metadata checkInDate/checkOutDate)
      this.database.query(
        `SELECT 
           AVG(DATEDIFF(
             JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkOutDate')),
             JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkInDate'))
           )) as avgStayDuration
         FROM bookings
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
           AND JSON_EXTRACT(metadata, '$.checkInDate') IS NOT NULL
           AND JSON_EXTRACT(metadata, '$.checkOutDate') IS NOT NULL
           AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkInDate')) != 'null'
           AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkOutDate')) != 'null'`,
        [periodStartStr, periodEndStr]
      ),

      // 13. Average lead time (days between created_at and check-in for active bookings)
      this.database.query(
        `SELECT 
           AVG(DATEDIFF(
             JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkInDate')),
             DATE(created_at)
           )) as avgLeadTime
         FROM bookings
         WHERE status IN ('CONFIRMED', 'COMPLETED')
           AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
           AND JSON_EXTRACT(metadata, '$.checkInDate') IS NOT NULL
           AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkInDate')) != 'null'`,
        [periodStartStr, periodEndStr]
      ),

      // 14. Hotel performance: top 10 by booking count
      this.database.query(
        `SELECT 
           h.id as hotelId,
           h.name as hotelName,
           COUNT(b.id) as totalBookings,
           COALESCE(SUM(CASE WHEN b.status IN ('CONFIRMED', 'COMPLETED') THEN b.total ELSE 0 END), 0) as totalRevenue,
           COALESCE(h.average_rating, 0) as averageRating,
           COALESCE(h.total_reviews, 0) as totalReviews
         FROM bookings b
         JOIN hotels h ON JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) = h.id
         WHERE b.created_at >= ? AND b.created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY h.id, h.name, h.average_rating, h.total_reviews
         ORDER BY totalBookings DESC
         LIMIT 10`,
        [periodStartStr, periodEndStr]
      ),

      // 15. Hotels with zero bookings
      this.database.query(
        `SELECT COUNT(*) as zeroBookingCount
         FROM hotels h
         WHERE h.id NOT IN (
           SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId'))
           FROM bookings b
           WHERE b.created_at >= ? AND b.created_at < DATE_ADD(?, INTERVAL 1 DAY)
             AND JSON_EXTRACT(b.metadata, '$.hotelId') IS NOT NULL
         )`,
        [periodStartStr, periodEndStr]
      ),

      // 16. Rating distribution (1-5)
      this.database.query(
        `SELECT rating, COUNT(*) as count
         FROM reviews
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY rating
         ORDER BY rating`,
        [periodStartStr, periodEndStr]
      ),

      // 17. Average rating
      this.database.query(
        `SELECT COALESCE(AVG(rating), 0) as averageRating
         FROM reviews
         WHERE created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)`,
        [periodStartStr, periodEndStr]
      ),

      // 18. Users by role
      this.database.query(
        `SELECT role, COUNT(*) as count
         FROM users
         GROUP BY role`,
        []
      ),

      // 19. Total user count
      this.database.query(
        `SELECT COUNT(*) as totalCount FROM users`,
        []
      ),

      // 20. Top 10 agents by revenue
      this.database.query(
        `SELECT 
           a.id as agentId,
           CONCAT(u.first_name, ' ', u.last_name) as agentName,
           COALESCE(SUM(b.total), 0) as revenue
         FROM agents a
         JOIN users u ON a.user_id = u.id
         JOIN bookings b ON b.agent_id = a.id
         WHERE b.status IN ('CONFIRMED', 'COMPLETED')
           AND b.created_at >= ? AND b.created_at < DATE_ADD(?, INTERVAL 1 DAY)
         GROUP BY a.id, u.first_name, u.last_name
         ORDER BY revenue DESC
         LIMIT 10`,
        [periodStartStr, periodEndStr]
      ),
    ]);

    // Process revenue
    const totalRevenue = parseFloat(revenueResult[0]?.totalRevenue) || 0;
    const activeCount = parseInt(revenueResult[0]?.activeCount) || 0;
    const averageRevenue = activeCount > 0 ? totalRevenue / activeCount : 0;

    const previousRevenue = parseFloat(previousRevenueResult[0]?.totalRevenue) || 0;
    let trend = 0;
    if (previousRevenue > 0) {
      trend = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (totalRevenue > 0) {
      trend = 100;
    }

    // Build daily revenue map (fill in missing days with 0)
    const dailyRevenueMap = new Map<string, number>();
    for (const row of dailyRevenueResult) {
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date);
      dailyRevenueMap.set(dateStr, parseFloat(row.amount) || 0);
    }
    const daily: Array<{ date: string; amount: number }> = [];
    const cursor = new Date(periodStart);
    while (cursor <= periodEnd) {
      const dateStr = cursor.toISOString().slice(0, 10);
      daily.push({ date: dateStr, amount: dailyRevenueMap.get(dateStr) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Top hotels by revenue
    const byHotel = topHotelsByRevenueResult.map((row: any) => ({
      hotelId: row.hotelId,
      hotelName: row.hotelName,
      revenue: parseFloat(row.revenue) || 0,
    }));

    // Revenue by source
    const bySource = revenueBySourceResult.map((row: any) => ({
      source: row.source || 'DIRECT',
      revenue: parseFloat(row.revenue) || 0,
    }));

    const brokerFees = parseFloat(brokerFeesResult[0]?.totalBrokerFees) || 0;

    // Process bookings
    const bookingTotal = parseInt(bookingTotalResult[0]?.total) || 0;

    const byStatus: Record<string, number> = {};
    for (const row of bookingsByStatusResult) {
      byStatus[row.status] = parseInt(row.count) || 0;
    }

    const confirmedCount = (byStatus['CONFIRMED'] || 0) + (byStatus['COMPLETED'] || 0);
    const conversionRate = bookingTotal > 0 ? (confirmedCount / bookingTotal) * 100 : 0;
    const expiredRate = bookingTotal > 0 ? ((byStatus['EXPIRED'] || 0) / bookingTotal) * 100 : 0;

    const bySourceBookings: Record<string, number> = {};
    for (const row of bookingsBySourceResult) {
      bySourceBookings[row.source || 'DIRECT'] = parseInt(row.count) || 0;
    }

    // Build daily volume map (fill in missing days)
    const dailyVolumeMap = new Map<string, { confirmed: number; completed: number; expired: number }>();
    for (const row of dailyVolumeResult) {
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date);
      dailyVolumeMap.set(dateStr, {
        confirmed: parseInt(row.confirmed) || 0,
        completed: parseInt(row.completed) || 0,
        expired: parseInt(row.expired) || 0,
      });
    }
    const dailyVolume: Array<{ date: string; confirmed: number; completed: number; expired: number }> = [];
    const volumeCursor = new Date(periodStart);
    while (volumeCursor <= periodEnd) {
      const dateStr = volumeCursor.toISOString().slice(0, 10);
      dailyVolume.push({
        date: dateStr,
        ...(dailyVolumeMap.get(dateStr) || { confirmed: 0, completed: 0, expired: 0 }),
      });
      volumeCursor.setDate(volumeCursor.getDate() + 1);
    }

    const byPaymentStatus: Record<string, number> = {};
    for (const row of bookingsByPaymentStatusResult) {
      byPaymentStatus[row.paymentStatus || 'PENDING'] = parseInt(row.count) || 0;
    }

    const averageStayDuration = parseFloat(stayDurationResult[0]?.avgStayDuration) || 0;
    const averageLeadTime = parseFloat(leadTimeResult[0]?.avgLeadTime) || 0;

    // Process hotel performance
    const performance = hotelPerformanceResult.map((row: any) => ({
      hotelId: row.hotelId,
      hotelName: row.hotelName,
      totalBookings: parseInt(row.totalBookings) || 0,
      totalRevenue: parseFloat(row.totalRevenue) || 0,
      averageRating: parseFloat(row.averageRating) || 0,
      totalReviews: parseInt(row.totalReviews) || 0,
    }));

    const zeroBookingCount = parseInt(zeroBookingCountResult[0]?.zeroBookingCount) || 0;

    // Process reviews
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of ratingDistributionResult) {
      const rating = parseInt(row.rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating] = parseInt(row.count) || 0;
      }
    }

    const averageRating = parseFloat(parseFloat(averageRatingResult[0]?.averageRating).toFixed(1)) || 0;

    // Process users
    const byRole: Record<string, number> = {};
    for (const row of usersByRoleResult) {
      byRole[row.role] = parseInt(row.count) || 0;
    }

    const userTotalCount = parseInt(userTotalResult[0]?.totalCount) || 0;

    const topAgents = topAgentsResult.map((row: any) => ({
      agentId: row.agentId,
      agentName: row.agentName,
      revenue: parseFloat(row.revenue) || 0,
    }));

    return {
      revenue: {
        total: totalRevenue,
        average: averageRevenue,
        trend,
        daily,
        byHotel,
        bySource,
        brokerFees,
      },
      bookings: {
        total: bookingTotal,
        conversionRate,
        averageStayDuration,
        averageLeadTime,
        byStatus,
        bySource: bySourceBookings,
        dailyVolume,
        byPaymentStatus,
        expiredRate,
      },
      hotels: {
        performance,
        zeroBookingCount,
      },
      reviews: {
        ratingDistribution,
        averageRating,
      },
      users: {
        byRole,
        totalCount: userTotalCount,
        topAgents,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        range,
        periodStart: periodStartStr,
        periodEnd: periodEndStr,
      },
    };
  }
}

export const createAnalyticsService = (database: Database): AnalyticsService => {
  return new AnalyticsService(database);
};
