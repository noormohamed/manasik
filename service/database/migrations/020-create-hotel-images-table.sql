-- Hotel Images table for storing image metadata
CREATE TABLE IF NOT EXISTS hotel_images (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    image_key VARCHAR(255) NOT NULL COMMENT 'S3 object key (path)',
    cdn_url VARCHAR(500) NOT NULL COMMENT 'Wasabi CDN URL',
    file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    file_size INT NOT NULL COMMENT 'File size in bytes',
    mime_type VARCHAR(50) NOT NULL COMMENT 'MIME type (image/jpeg, etc.)',
    uploaded_by VARCHAR(36) NOT NULL COMMENT 'User ID who uploaded',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Is this the hero/primary image',
    image_number INT NOT NULL COMMENT 'Sequential image number for this hotel',
    display_order INT DEFAULT 0 COMMENT 'Display order for sorting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_hotel_images_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_hotel_images_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_hotel_images_hotel (hotel_id),
    INDEX idx_hotel_images_uploaded_by (uploaded_by),
    INDEX idx_hotel_images_created_at (created_at),
    INDEX idx_hotel_images_is_primary (is_primary),
    INDEX idx_hotel_images_display_order (display_order),
    
    -- Unique constraint on S3 key
    UNIQUE KEY unique_s3_key (image_key)
);
