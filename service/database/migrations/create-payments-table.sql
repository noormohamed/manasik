-- Create payments table for Stripe payment records
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    booking_id VARCHAR(36),
    customer_id VARCHAR(36),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_payments_session_id (session_id),
    INDEX idx_payments_booking_id (booking_id),
    INDEX idx_payments_customer_id (customer_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created_at (created_at)
);

-- Add foreign key constraints if tables exist
-- ALTER TABLE payments ADD CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
-- ALTER TABLE payments ADD CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;
