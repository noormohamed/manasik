# Manasik Score Enhancements - Implementation Tasks

## Overview
Automate Location metrics (Walking Time, Route Ease) based on Gate Proximity and Experience Friction based on review data. All calculations are read-only and deterministic to ensure fairness.

---

## Phase 1: Database Schema & Migrations

- [x] 1.1 Create migration for review friction data table
  - Add `review_friction_responses` table to store individual friction responses
  - Columns: id, review_id, hotel_id, friction_type (lift_delays|crowding|checkin), response (yes|no|na|smooth|average|difficult), created_at
  - Add indexes on review_id, hotel_id, friction_type

- [x] 1.2 Add calculation audit trail table
  - Add `score_calculations` table to track all score calculations
  - Columns: id, hotel_id, metric_type (location|experience_friction), calculated_value, input_data (JSON), calculation_timestamp, calculation_basis
  - Add indexes on hotel_id, metric_type, calculation_timestamp

- [x] 1.3 Add calculation metadata columns to hotels table
  - Add `location_metrics_calculated_at` timestamp
  - Add `location_metrics_calculation_basis` JSON (stores gate_proximity_meters, terrain_data, etc.)
  - Add `experience_friction_calculated_at` timestamp
  - Add `experience_friction_review_count` integer
  - Add `experience_friction_calculation_basis` JSON (stores review counts per friction type)

- [x] 1.4 Create migration script
  - Write SQL migration file: `service/database/migrations/009-manasik-score-automation.sql`
  - Include all table creations and column additions
  - Add data migration to populate calculation timestamps for existing hotels

---

## Phase 2: Backend Service Updates

- [x] 2.1 Extend scoring.service.ts with location calculation functions
  - Add `calculateWalkingTimeFromDistance(distanceMeters: number): number` function
    - Formula: distance / 1.4 / 60, rounded to nearest minute
    - Returns 1-3 score based on minutes (≤3min=3, ≤5min=3, ≤8min=2, ≤12min=2, >12min=1)
  - Add `calculateRouteEaseFromDistance(distanceMeters: number, terrainData?: any): number` function
    - Base: <200m=3, 200-500m=2, >500m=1
    - Adjust for elevation changes, stairs, accessibility features
    - Returns 1-3 score
  - Add `calculateLocationMetrics(gateProximityMeters: number, terrainData?: any): LocationScores` function
    - Calculates all three location metrics from gate proximity
    - Returns LocationScores object with calculated values

- [x] 2.2 Extend scoring.service.ts with experience friction calculation functions
  - Add `calculateExperienceFrictionFromReviews(hotelId: string): Promise<ExperienceFrictionScores>` function
    - Query review_friction_responses for hotel
    - Calculate percentage for lift_delays and crowding (yes responses / total applicable)
    - Calculate average for checkin (smooth=3, average=2, difficult=1)
    - Convert percentages to 1-3 scores (0-33%=3, 34-66%=2, 67-100%=1)
    - Return ExperienceFrictionScores object
  - Add `getExperienceFrictionCalculationBasis(hotelId: string): Promise<any>` function
    - Returns object with review counts per friction type and percentages

- [x] 2.3 Create review-friction.service.ts
  - Add `storeReviewFrictionResponse(reviewId: string, hotelId: string, frictionType: string, response: string): Promise<void>` function
  - Add `getReviewFrictionResponses(hotelId: string): Promise<any[]>` function
  - Add `deleteReviewFrictionResponses(reviewId: string): Promise<void>` function (for review deletion)

- [x] 2.4 Update hotel.repository.ts
  - Modify `scoringForRow()` to use calculated location metrics instead of manual input
  - Add logic to fetch and use calculated experience friction scores
  - Store calculation basis and timestamps in database
  - Ensure read-only enforcement (no manual overrides)

- [x] 2.5 Create score-calculation-audit.service.ts
  - Add `logScoreCalculation(hotelId: string, metricType: string, calculatedValue: any, inputData: any, basis: string): Promise<void>` function
  - Add `getCalculationAuditTrail(hotelId: string, limit?: number): Promise<any[]>` function
  - Add `getCalculationHistory(hotelId: string, metricType: string, dateRange?: any): Promise<any[]>` function

- [x] 2.6 Update review.service.ts
  - Modify review submission to capture friction responses
  - Trigger recalculation of experience friction score after review submission
  - Update hotel's experience_friction_calculated_at timestamp
  - Log calculation to audit trail

---

## Phase 3: API Endpoints

- [ ] 3.1 Create GET /api/hotels/:hotelId/score-calculation-details endpoint
  - Returns detailed calculation information for all metrics
  - Includes calculation basis, input data, timestamps
  - Shows how each metric was derived
  - Returns calculation audit trail (last 10 calculations)

- [ ] 3.2 Create GET /api/hotels/:hotelId/location-metrics endpoint
  - Returns calculated location metrics with basis
  - Shows gate proximity distance used in calculation
  - Shows walking time calculation (distance → minutes → score)
  - Shows route ease calculation basis
  - All fields marked as read-only

- [ ] 3.3 Create GET /api/hotels/:hotelId/experience-friction-details endpoint
  - Returns experience friction calculation details
  - Shows review count and friction response breakdown
  - Shows percentages for each friction type
  - Shows how percentages map to 1-3 scores
  - Shows "Insufficient Data" if <5 reviews

- [ ] 3.4 Create POST /api/reviews/:reviewId/friction-responses endpoint
  - Accepts friction response data from review form
  - Validates that hotel is of type "hotel" (not apartment/villa)
  - Stores responses in review_friction_responses table
  - Triggers experience friction recalculation
  - Returns updated experience friction score

- [ ] 3.5 Create GET /api/admin/score-monitoring/dashboard endpoint
  - Returns aggregated score statistics
  - Shows distribution of calculated vs insufficient data scores
  - Shows recent score changes and their causes
  - Shows data quality metrics
  - Requires admin authentication

- [ ] 3.6 Create GET /api/admin/score-monitoring/audit-logs endpoint
  - Returns paginated calculation audit logs
  - Supports filtering by hotel, date range, metric type
  - Requires admin authentication

---

## Phase 4: Frontend Components

- [x] 4.1 Create ScoreCalculationDetails component
  - Displays "How This Score Is Calculated" section
  - Shows calculation basis for each metric
  - Shows input data used (gate proximity, review count, etc.)
  - Shows when metric was last updated
  - Shows number of data points used
  - Displays "Insufficient Data" message when applicable
  - No manual override options visible

- [x] 4.2 Update review form component
  - Add friction questions section (only for hotels)
  - Questions:
    1. "Did you experience lift/elevator delays?" (Yes/No/Not Applicable)
    2. "Was the hotel crowded at peak times?" (Yes/No/Not Applicable)
    3. "How smooth was the check-in experience?" (Smooth/Average/Difficult)
  - Make questions optional
  - Submit friction responses along with review
  - Show loading state while submitting

- [ ] 4.3 Update hotel details page
  - Display ScoreCalculationDetails component
  - Show location metrics as read-only fields
  - Show experience friction with calculation basis
  - Display "Insufficient Data" for experience friction if <5 reviews
  - Add link to detailed methodology documentation

- [ ] 4.4 Create admin score monitoring dashboard
  - Display score statistics (calculated vs insufficient data)
  - Show score distribution chart
  - Show recent score changes with causes
  - Show data quality metrics
  - Allow filtering by hotel, date range, metric type
  - Show calculation audit logs
  - Add export functionality

- [ ] 4.5 Update ProximityInfo component
  - Display walking time as calculated value (not editable)
  - Show calculation basis: "Calculated from 450m gate distance at 5 km/h average pace"
  - Display route ease as calculated value (not editable)
  - Show calculation basis with terrain factors if applicable
  - Add tooltip explaining calculation methodology

---

## Phase 5: Data Migration & Backfill

- [ ] 5.1 Create backfill script for existing hotels
  - For each hotel with gate_proximity data:
    - Calculate location metrics using new algorithm
    - Store calculation basis and timestamp
    - Log to calculation audit trail
  - For each hotel with reviews:
    - Aggregate existing review data to estimate friction responses
    - Calculate experience friction score
    - Store calculation basis and timestamp
    - Log to calculation audit trail

- [ ] 5.2 Create data validation script
  - Verify all hotels have location metrics calculated
  - Verify calculation basis is stored for all metrics
  - Verify audit trail entries exist for all calculations
  - Report any missing or inconsistent data

- [ ] 5.3 Run backfill and validation
  - Execute backfill script on development database
  - Run validation script
  - Verify results are correct
  - Document any issues found

---

## Phase 6: Testing

- [ ] 6.1 Write unit tests for scoring functions
  - Test `calculateWalkingTimeFromDistance()` with various distances
  - Test `calculateRouteEaseFromDistance()` with various terrain data
  - Test `calculateExperienceFrictionFromReviews()` with various review counts
  - Test edge cases (0 reviews, 1 review, 100+ reviews)
  - Test calculation consistency (same inputs = same outputs)

- [ ] 6.2 Write integration tests for review friction submission
  - Test friction response storage
  - Test experience friction recalculation after review submission
  - Test audit trail logging
  - Test insufficient data handling

- [ ] 6.3 Write API endpoint tests
  - Test GET /api/hotels/:hotelId/score-calculation-details
  - Test GET /api/hotels/:hotelId/location-metrics
  - Test GET /api/hotels/:hotelId/experience-friction-details
  - Test POST /api/reviews/:reviewId/friction-responses
  - Test admin endpoints with authentication

- [ ] 6.4 Write frontend component tests
  - Test ScoreCalculationDetails component rendering
  - Test review form friction questions display (hotel only)
  - Test friction response submission
  - Test read-only enforcement on location metrics

- [ ] 6.5 Write end-to-end tests
  - Test complete flow: submit review with friction responses → score recalculates
  - Test location metrics calculation from gate proximity
  - Test insufficient data handling
  - Test admin dashboard functionality

---

## Phase 7: Documentation & Deployment

- [ ] 7.1 Create calculation methodology documentation
  - Document walking time calculation formula
  - Document route ease calculation logic
  - Document experience friction aggregation algorithm
  - Document how percentages map to 1-3 scores
  - Include examples and edge cases

- [ ] 7.2 Create admin guide
  - Explain how to monitor score calculations
  - Explain how to interpret calculation audit logs
  - Explain how to handle data quality issues
  - Explain how to update calculation rules (if needed)

- [ ] 7.3 Create user-facing documentation
  - Explain how scores are calculated
  - Explain what friction questions mean
  - Explain why scores are read-only
  - Explain how to interpret calculation basis

- [ ] 7.4 Update API documentation
  - Document new endpoints
  - Document request/response formats
  - Document error codes
  - Document authentication requirements

- [ ] 7.5 Prepare deployment checklist
  - Database migration script ready
  - Backfill script tested
  - All tests passing
  - Documentation complete
  - Admin notified of changes

- [ ] 7.6 Deploy to production
  - Run database migration
  - Run backfill script
  - Deploy backend changes
  - Deploy frontend changes
  - Monitor for errors
  - Verify scores are calculating correctly

---

## Correctness Properties Validation

- [ ] 8.1 Validate Location Metrics Determinism
  - Property: Same gate proximity distance always produces same walking time and route ease
  - Test: Calculate same distance 10 times, verify identical results
  - Test: Calculate different distances, verify different results

- [ ] 8.2 Validate Experience Friction Consistency
  - Property: Same review data always produces same experience friction score
  - Test: Process same reviews in different order, verify identical results
  - Test: Recalculate score multiple times, verify identical results

- [ ] 8.3 Validate No Manual Overrides
  - Property: System prevents any manual override of calculated metrics
  - Test: Attempt to edit location metrics via API, verify rejection
  - Test: Attempt to edit experience friction via API, verify rejection
  - Test: Verify UI shows read-only fields

- [ ] 8.4 Validate Fairness Across Hotels
  - Property: All hotels evaluated using identical calculation rules
  - Test: Calculate scores for 10 hotels with same gate proximity, verify identical results
  - Test: Verify no exceptions or special cases in calculations

- [ ] 8.5 Validate Data Integrity
  - Property: All input data validated and stored immutably
  - Test: Verify invalid gate proximity rejected
  - Test: Verify calculation audit trail is immutable
  - Test: Verify historical records preserved

- [ ] 8.6 Validate Real-Time Updates
  - Property: New data triggers recalculation within 5 seconds
  - Test: Submit review, verify score updates within 5 seconds
  - Test: Update gate proximity, verify location metrics update within 5 seconds

- [ ] 8.7 Validate Transparency
  - Property: Every calculated score includes visible documentation
  - Test: Verify calculation details endpoint returns complete information
  - Test: Verify UI displays calculation basis for all metrics

- [ ] 8.8 Validate Graceful Degradation
  - Property: System displays "Insufficient Data" instead of estimating
  - Test: Verify <5 reviews shows "Insufficient Data"
  - Test: Verify missing gate proximity shows "Data Not Available"
  - Test: Verify no default values used

---

## Success Criteria

✅ All location metrics calculated automatically from gate proximity
✅ All experience friction metrics calculated from review data
✅ No manual overrides possible for calculated metrics
✅ All calculations logged to audit trail
✅ Calculation basis visible to users
✅ "Insufficient Data" displayed when appropriate
✅ Scores update in real-time when new data arrives
✅ All correctness properties validated
✅ All tests passing
✅ Documentation complete
✅ Zero disruption to existing functionality

