# Manasik Score Enhancements - Requirements

## Introduction

The Manasik Score is a comprehensive rating system that evaluates hotels across multiple dimensions to help pilgrims make informed booking decisions. Currently, the Location section requires manual input for Walking Time, Gate Proximity, and Route Ease. Additionally, Experience Friction metrics are manually entered rather than derived from actual guest reviews.

This feature enhances the Manasik Score system by automating two critical sections:

1. **Location Metrics** - Automatically calculate Walking Time and Route Ease based on Gate Proximity as the primary data source
2. **Experience Friction** - Automatically calculate based on structured review data about specific operational challenges

These changes ensure fairness, consistency, and accuracy across all hotel ratings while reducing manual data entry burden.

## Glossary

- **Manasik Score**: Comprehensive hotel rating system with multiple dimensions (Location, Pilgrim Suitability, Hotel Quality, Experience Friction)
- **Gate Proximity**: Distance from hotel to nearest Haram gate (primary metric for Location calculations)
- **Walking Time**: Estimated time to walk from hotel to Haram gate (calculated from Gate Proximity)
- **Route Ease**: Assessment of route difficulty/accessibility (calculated from Gate Proximity and terrain data)
- **Experience Friction**: Measure of operational challenges that impact guest experience (Lift Delays, Crowding, Check-in Experience)
- **Friction Metric**: Individual component of Experience Friction (Lift Delays, Crowding at Peak Times, Check-in Smoothness)
- **Review Data**: Structured feedback from guests about specific operational aspects
- **Calculation Algorithm**: Deterministic formula that converts raw data into standardized scores
- **Override Prevention**: System design that prevents manual adjustment of calculated values
- **Fairness**: Consistent application of calculation rules across all hotels
- **Effectiveness**: Accuracy of calculations in reflecting actual guest experience

## Requirements

### Requirement 1: Automatically Calculate Walking Time from Gate Proximity

**User Story:** As a system, I want to automatically calculate Walking Time based on Gate Proximity distance, so that this metric is consistent and fair across all hotels.

#### Acceptance Criteria

1. WHEN a hotel's Gate Proximity distance is recorded, THE system SHALL automatically calculate Walking Time
2. THE calculation SHALL use a standard walking speed of 1.4 meters per second (5 km/h average pilgrim pace)
3. WHEN Gate Proximity distance is provided in meters, THE system SHALL convert to walking time in minutes
4. THE formula SHALL be: Walking Time (minutes) = Gate Proximity Distance (meters) / 1.4 / 60
5. WHEN the calculation is complete, THE system SHALL round to the nearest minute
6. WHEN Walking Time is calculated, THE system SHALL display it as a read-only value (no manual override)
7. WHEN Gate Proximity changes, THE system SHALL automatically recalculate Walking Time
8. THE calculated Walking Time SHALL be stored in the database for audit and historical tracking
9. WHEN displaying the score, THE system SHALL show the calculation basis (e.g., "Calculated from 450m gate distance")
10. THE calculation SHALL be applied to all hotels, both new and existing

### Requirement 2: Automatically Calculate Route Ease from Gate Proximity and Terrain Data

**User Story:** As a system, I want to automatically calculate Route Ease based on Gate Proximity and terrain characteristics, so that this metric reflects actual accessibility.

#### Acceptance Criteria

1. WHEN a hotel's Gate Proximity and terrain data are available, THE system SHALL automatically calculate Route Ease
2. THE calculation SHALL consider: distance to gate, elevation changes, stair requirements, and accessibility features
3. WHEN Gate Proximity is less than 200 meters, THE system SHALL assign Route Ease as "Good" (3/3)
4. WHEN Gate Proximity is 200-500 meters, THE system SHALL assign Route Ease as "Average" (2/3)
5. WHEN Gate Proximity is greater than 500 meters, THE system SHALL assign Route Ease as "Poor" (1/3)
6. IF terrain data indicates significant elevation changes (>20 meters), THE system SHALL reduce Route Ease by one level
7. IF terrain data indicates stairs required, THE system SHALL reduce Route Ease by one level
8. IF hotel has wheelchair accessibility features, THE system SHALL increase Route Ease by one level (minimum "Average")
9. WHEN Route Ease is calculated, THE system SHALL display it as a read-only value (no manual override)
10. WHEN Gate Proximity or terrain data changes, THE system SHALL automatically recalculate Route Ease
11. THE calculated Route Ease SHALL be stored in the database for audit and historical tracking
12. WHEN displaying the score, THE system SHALL show the calculation basis (e.g., "Based on 350m distance + stairs")

### Requirement 3: Prevent Manual Override of Location Metrics

**User Story:** As a system, I want to prevent manual override of calculated Location metrics, so that all hotels are evaluated fairly and consistently.

#### Acceptance Criteria

1. WHEN displaying Location metrics (Walking Time, Gate Proximity, Route Ease), THE system SHALL show them as read-only fields
2. WHEN a user attempts to edit a calculated Location metric, THE system SHALL display a message explaining it's automatically calculated
3. THE message SHALL indicate the calculation basis and when it was last updated
4. WHEN Gate Proximity is updated (the only editable Location field), THE system SHALL automatically recalculate dependent metrics
5. THE system SHALL NOT allow direct editing of Walking Time or Route Ease fields
6. WHEN displaying the Location section, THE system SHALL clearly indicate which metrics are calculated vs. editable
7. THE system SHALL log all Location metric calculations for audit purposes
8. WHEN a user views the score, THE system SHALL display a "Calculation Details" section showing how each metric was derived

### Requirement 4: Collect Friction Metrics During Hotel Reviews

**User Story:** As a system, I want to collect structured data about operational challenges during guest reviews, so that Experience Friction is based on actual guest feedback.

#### Acceptance Criteria

1. WHEN a guest completes a booking at a hotel, THE system SHALL prompt them to leave a review
2. WHEN the guest starts a review for a hotel, THE system SHALL display three friction-related questions:
   - "Did you experience lift/elevator delays?" (Yes/No/Not Applicable)
   - "Was the hotel crowded at peak times?" (Yes/No/Not Applicable)
   - "How smooth was the check-in experience?" (Smooth/Average/Difficult)
3. IF the guest is reviewing a non-hotel property (e.g., apartment, villa), THE system SHALL NOT display friction questions
4. WHEN the guest answers friction questions, THE system SHALL store the responses in the database
5. THE friction questions SHALL be optional (guest can skip them)
6. WHEN a guest selects "Not Applicable", THE system SHALL not count that response in calculations
7. WHEN the review is submitted, THE system SHALL link the friction data to the hotel and booking
8. THE system SHALL timestamp each friction response for historical tracking
9. WHEN displaying the review form, THE system SHALL clearly indicate which questions are about operational challenges
10. THE system SHALL validate that friction responses are captured before allowing review submission (if guest chooses to answer)

### Requirement 5: Automatically Calculate Experience Friction from Review Data

**User Story:** As a system, I want to automatically calculate Experience Friction scores based on aggregated review data, so that this metric reflects actual guest experiences.

#### Acceptance Criteria

1. WHEN calculating Experience Friction for a hotel, THE system SHALL aggregate all friction responses from guest reviews
2. THE system SHALL calculate three sub-metrics:
   - **Lift Delays**: Percentage of guests who reported lift/elevator delays
   - **Crowding**: Percentage of guests who reported crowding at peak times
   - **Check-in Smoothness**: Average rating of check-in experience (Smooth=3, Average=2, Difficult=1)
3. WHEN calculating Lift Delays, THE system SHALL use: (Number of "Yes" responses / Total applicable responses) × 100
4. WHEN calculating Crowding, THE system SHALL use: (Number of "Yes" responses / Total applicable responses) × 100
5. WHEN calculating Check-in Smoothness, THE system SHALL use: (Sum of ratings / Total responses) / 3 × 100
6. WHEN a sub-metric is 0-33%, THE system SHALL assign score as "Good" (3/3)
7. WHEN a sub-metric is 34-66%, THE system SHALL assign score as "Average" (2/3)
8. WHEN a sub-metric is 67-100%, THE system SHALL assign score as "Poor" (1/3)
9. WHEN all three sub-metrics are calculated, THE system SHALL average them to get overall Experience Friction score
10. WHEN fewer than 5 reviews exist for a hotel, THE system SHALL display "Insufficient Data" instead of a score
11. THE system SHALL recalculate Experience Friction whenever a new review is submitted
12. THE calculated Experience Friction SHALL be stored in the database with timestamp and review count
13. WHEN displaying the score, THE system SHALL show the calculation basis (e.g., "Based on 42 reviews")

### Requirement 6: Display Calculation Methodology Transparently

**User Story:** As a guest, I want to understand how hotel scores are calculated, so that I can trust the ratings and make informed decisions.

#### Acceptance Criteria

1. WHEN viewing a hotel's Manasik Score, THE system SHALL display a "How This Score Is Calculated" section
2. THE section SHALL explain that Location metrics are automatically calculated from gate proximity
3. THE section SHALL explain that Experience Friction is calculated from guest reviews
4. WHEN a guest clicks on a specific metric, THE system SHALL display detailed calculation information:
   - For Location: "Walking Time calculated from 450m gate distance at 5 km/h average pace = 5 minutes"
   - For Experience Friction: "Based on 42 guest reviews: 28% reported lift delays, 35% reported crowding, 90% smooth check-in"
5. THE system SHALL display when each metric was last updated
6. THE system SHALL display the number of data points used in calculations (e.g., "42 reviews")
7. WHEN insufficient data exists, THE system SHALL clearly indicate this (e.g., "Insufficient reviews for accurate calculation")
8. THE system SHALL NOT display manual override options or allow users to adjust calculated values
9. WHEN displaying calculation details, THE system SHALL use clear, non-technical language
10. THE system SHALL provide a link to detailed methodology documentation

### Requirement 7: Ensure Fairness Through Consistent Calculation Rules

**User Story:** As a platform, I want to ensure all hotels are evaluated using the same calculation rules, so that the scoring system is fair and trustworthy.

#### Acceptance Criteria

1. WHEN calculating Location metrics, THE system SHALL apply identical formulas to all hotels
2. WHEN calculating Experience Friction, THE system SHALL apply identical aggregation rules to all hotels
3. THE system SHALL NOT allow exceptions or special cases in calculations
4. WHEN a calculation rule is updated, THE system SHALL recalculate all affected hotels retroactively
5. THE system SHALL log all calculation rule changes for audit purposes
6. WHEN displaying scores, THE system SHALL indicate if a hotel's score was recalculated due to rule changes
7. THE system SHALL maintain historical records of all score calculations
8. WHEN comparing hotels, THE system SHALL ensure all scores were calculated using the same methodology
9. THE system SHALL prevent any manual adjustments that would create unfair advantages
10. THE system SHALL provide audit reports showing calculation consistency across all hotels

### Requirement 8: Handle Insufficient Data Gracefully

**User Story:** As a system, I want to handle cases where insufficient data exists for calculations, so that users understand score reliability.

#### Acceptance Criteria

1. WHEN fewer than 5 reviews exist for a hotel, THE system SHALL display "Insufficient Data" for Experience Friction
2. WHEN Gate Proximity data is missing, THE system SHALL display "Data Not Available" for Location metrics
3. WHEN insufficient data exists, THE system SHALL NOT display a calculated score
4. WHEN insufficient data exists, THE system SHALL display a message explaining what data is needed
5. WHEN sufficient data becomes available, THE system SHALL automatically calculate and display the score
6. THE system SHALL track when scores transition from "Insufficient Data" to calculated values
7. WHEN displaying "Insufficient Data", THE system SHALL indicate how many more reviews are needed
8. THE system SHALL allow users to check back later for updated scores
9. WHEN a hotel has mixed data (some metrics sufficient, others insufficient), THE system SHALL display available metrics and indicate missing ones
10. THE system SHALL NOT estimate or interpolate missing data

### Requirement 9: Update Scores in Real-Time

**User Story:** As a system, I want to update hotel scores in real-time when new data is available, so that scores always reflect current information.

#### Acceptance Criteria

1. WHEN a new review is submitted with friction data, THE system SHALL recalculate Experience Friction immediately
2. WHEN Gate Proximity is updated, THE system SHALL recalculate Walking Time and Route Ease immediately
3. WHEN terrain data is updated, THE system SHALL recalculate Route Ease immediately
4. WHEN a score is recalculated, THE system SHALL update the database and cache
5. WHEN a score is recalculated, THE system SHALL update the hotel's display in real-time (if user is viewing)
6. THE system SHALL NOT delay score updates for batch processing
7. WHEN a score changes significantly (>0.5 points), THE system SHALL log this as a notable event
8. THE system SHALL maintain a changelog of all score updates
9. WHEN displaying a score, THE system SHALL indicate when it was last updated
10. THE system SHALL handle concurrent updates gracefully (multiple reviews submitted simultaneously)

### Requirement 10: Provide Admin Dashboard for Score Monitoring

**User Story:** As an admin, I want to monitor score calculations and data quality, so that I can ensure the system is working correctly.

#### Acceptance Criteria

1. WHEN an admin accesses the score monitoring dashboard, THE system SHALL display:
   - Number of hotels with calculated vs. insufficient data scores
   - Distribution of scores across all hotels
   - Recent score changes and their causes
   - Data quality metrics (review count, gate proximity coverage, etc.)
2. THE dashboard SHALL allow filtering by hotel, date range, and metric type
3. THE dashboard SHALL display calculation audit logs showing all score updates
4. WHEN an admin clicks on a hotel, THE system SHALL display detailed calculation information
5. THE dashboard SHALL show which hotels have missing data and what's needed
6. THE dashboard SHALL alert admins if calculation rules are producing unexpected results
7. THE dashboard SHALL allow admins to view historical score trends
8. THE dashboard SHALL NOT allow admins to manually override calculated scores
9. THE dashboard SHALL provide export functionality for score data and audit logs
10. THE dashboard SHALL display performance metrics (calculation time, cache hit rates, etc.)

### Requirement 11: Validate Gate Proximity Data Quality

**User Story:** As a system, I want to validate Gate Proximity data to ensure calculations are accurate, so that scores are reliable.

#### Acceptance Criteria

1. WHEN Gate Proximity data is entered, THE system SHALL validate that distance is between 0 and 5000 meters
2. IF Gate Proximity is outside valid range, THE system SHALL display an error message
3. WHEN Gate Proximity is entered, THE system SHALL verify it's reasonable for the hotel's location
4. IF Gate Proximity seems incorrect (e.g., hotel in Makkah but 10km from gate), THE system SHALL flag for review
5. THE system SHALL allow admins to correct invalid Gate Proximity data
6. WHEN Gate Proximity is corrected, THE system SHALL recalculate dependent metrics
7. THE system SHALL track all Gate Proximity corrections for audit purposes
8. WHEN displaying Gate Proximity, THE system SHALL indicate data source (GPS, manual entry, estimated)
9. THE system SHALL validate that Gate Proximity is consistent with hotel coordinates
10. THE system SHALL alert admins if multiple hotels have identical Gate Proximity values (potential data entry error)

### Requirement 12: Maintain Calculation Audit Trail

**User Story:** As a system, I want to maintain detailed audit trails of all calculations, so that I can verify accuracy and troubleshoot issues.

#### Acceptance Criteria

1. WHEN a score is calculated, THE system SHALL record:
   - Calculation timestamp
   - Input data used (gate proximity, review count, etc.)
   - Calculation formula applied
   - Resulting score
   - User/system that triggered the calculation
2. WHEN a score is recalculated, THE system SHALL record the previous score and reason for recalculation
3. THE audit trail SHALL be immutable (cannot be modified after creation)
4. WHEN an admin views a hotel's score, THE system SHALL display the audit trail
5. THE audit trail SHALL show all historical scores and when they changed
6. THE system SHALL allow filtering audit logs by hotel, date range, and metric type
7. THE system SHALL provide reports showing calculation accuracy and consistency
8. WHEN a calculation error is discovered, THE system SHALL use the audit trail to identify affected hotels
9. THE system SHALL allow admins to export audit logs for compliance purposes
10. THE audit trail SHALL be retained for at least 2 years

## Correctness Properties

### Property 1: Location Metrics Determinism
For any given Gate Proximity distance, the calculated Walking Time and Route Ease SHALL always be identical when calculated at different times (assuming no changes to underlying data).

### Property 2: Experience Friction Consistency
The Experience Friction score for a hotel SHALL be the same regardless of the order in which reviews are processed or when the calculation is performed.

### Property 3: No Manual Overrides
The system SHALL NOT allow any user (including admins) to manually override calculated Location metrics or Experience Friction scores.

### Property 4: Fairness Across Hotels
All hotels SHALL be evaluated using identical calculation formulas and rules, with no exceptions or special cases.

### Property 5: Data Integrity
All input data used in calculations (Gate Proximity, review responses) SHALL be validated and stored immutably in the audit trail.

### Property 6: Real-Time Updates
When new data becomes available (new review, updated Gate Proximity), affected scores SHALL be recalculated and updated within 5 seconds.

### Property 7: Transparency
Every calculated score SHALL include visible documentation of how it was calculated, including input data and formula used.

### Property 8: Graceful Degradation
When insufficient data exists for calculation, the system SHALL display "Insufficient Data" rather than estimating or using default values.

