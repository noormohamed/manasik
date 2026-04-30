-- Image upload audit table for tracking upload attempts and errors
CREATE TABLE IF NOT EXISTS image_upload_audit (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    hotel_id VARCHAR(36) NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'RETRY') NOT NULL,
    error_message TEXT,
    file_name VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(50),
    s3_key VARCHAR(255),
    attempt_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_hotel (hotel_id),
    INDEX idx_audit_created_at (created_at),
    INDEX idx_audit_status (status)
);
