-- Migration 030: Add EXPIRED status to bookings
-- Allows marking unpaid bookings past their check-in date as expired

ALTER TABLE bookings MODIFY COLUMN status ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED','REFUNDED','EXPIRED') DEFAULT 'PENDING';

-- Expire unpaid bookings past their check-in date (not COMPLETED - those actually stayed)
UPDATE bookings 
SET status = 'EXPIRED'
WHERE status IN ('PENDING', 'CONFIRMED')
  AND payment_status = 'PENDING'
  AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.checkInDate')) < CURDATE();
