-- This script populates hotel_gate_distances for all hotels and then assigns gates to each hotel
-- Run this after applying migration 019-add-hotel-gate-assignments.sql

-- First, let's populate hotel_gate_distances with sample data for all hotels
-- This assumes hotels have location coordinates. We'll calculate approximate distances based on hotel coordinates

INSERT INTO hotel_gate_distances (id, hotel_id, gate_id, distance_meters, walking_time_minutes, is_recommended)
SELECT 
    UUID(),
    h.id,
    hg.id,
    -- Simple distance calculation (in real implementation, use proper haversine formula)
    -- For now, we'll assign all gates with varying distances to each hotel
    ROUND(SQRT(
        POW((h.latitude - hg.latitude) * 111000, 2) + 
        POW((h.longitude - hg.longitude) * 111000, 2)
    )) as distance_meters,
    -- Estimate 1.4 m/s walking speed (5 km/h)
    ROUND(SQRT(
        POW((h.latitude - hg.latitude) * 111000, 2) + 
        POW((h.longitude - hg.longitude) * 111000, 2)
    ) / 1.4 / 60) as walking_time_minutes,
    -- Mark as recommended if distance is less than 500m
    IF(SQRT(
        POW((h.latitude - hg.latitude) * 111000, 2) + 
        POW((h.longitude - hg.longitude) * 111000, 2)
    ) < 500, TRUE, FALSE) as is_recommended
FROM hotels h
CROSS JOIN haram_gates hg
WHERE NOT EXISTS (
    SELECT 1 FROM hotel_gate_distances 
    WHERE hotel_id = h.id AND gate_id = hg.id
);

-- Now run the stored procedure to assign gates to hotels
CALL populate_hotel_gate_assignments();

-- Verify the assignments
SELECT 
    h.id,
    h.name,
    hga.closest_gate_id,
    cg.name_english as closest_gate_name,
    hga.kaaba_gate_id,
    kg.name_english as kaaba_gate_name,
    hga.created_at
FROM hotel_gate_assignments hga
JOIN hotels h ON hga.hotel_id = h.id
LEFT JOIN haram_gates cg ON hga.closest_gate_id = cg.id
LEFT JOIN haram_gates kg ON hga.kaaba_gate_id = kg.id
LIMIT 20;
