-- Add hotel_gate_assignment table to store the closest and kaaba gates for each hotel
CREATE TABLE IF NOT EXISTS hotel_gate_assignments (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL UNIQUE,
    closest_gate_id VARCHAR(36),
    kaaba_gate_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (closest_gate_id) REFERENCES haram_gates(id),
    FOREIGN KEY (kaaba_gate_id) REFERENCES haram_gates(id),
    INDEX idx_hotel_id (hotel_id)
);

-- Add column to hotels table to mark if gates have been assigned
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS gates_assigned BOOLEAN DEFAULT FALSE;

-- Create a stored procedure to automatically populate hotel gate assignments
-- This procedure finds the closest gate and a kaaba gate for each hotel based on distance
DELIMITER //

CREATE PROCEDURE populate_hotel_gate_assignments()
BEGIN
    DECLARE hotel_count INT;
    DECLARE processed INT DEFAULT 0;
    DECLARE hotel_id_var VARCHAR(36);
    DECLARE cursor_hotels CURSOR FOR SELECT id FROM hotels WHERE gates_assigned = FALSE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET hotel_count = 0;
    
    -- Get count for logging
    SELECT COUNT(*) INTO hotel_count FROM hotels WHERE gates_assigned = FALSE;
    
    OPEN cursor_hotels;
    
    read_loop: LOOP
        FETCH cursor_hotels INTO hotel_id_var;
        IF hotel_count = 0 THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert assignment for this hotel
        INSERT IGNORE INTO hotel_gate_assignments (id, hotel_id, closest_gate_id, kaaba_gate_id)
        SELECT 
            UUID(),
            hotel_id_var,
            -- Closest gate (minimum distance)
            (SELECT gate_id FROM hotel_gate_distances 
             WHERE hotel_id = hotel_id_var 
             ORDER BY distance_meters ASC 
             LIMIT 1),
            -- Kaaba gate (Gate 1 - King Abdul Aziz Gate with direct access)
            'gate-001'
        ON DUPLICATE KEY UPDATE 
            closest_gate_id = VALUES(closest_gate_id),
            kaaba_gate_id = VALUES(kaaba_gate_id),
            updated_at = CURRENT_TIMESTAMP;
        
        -- Mark hotel as processed
        UPDATE hotels SET gates_assigned = TRUE WHERE id = hotel_id_var;
        SET processed = processed + 1;
    END LOOP;
    
    CLOSE cursor_hotels;
    SELECT CONCAT('Processed ', processed, ' hotels') AS status;
END //

DELIMITER ;
