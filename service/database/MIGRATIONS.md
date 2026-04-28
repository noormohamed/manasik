# Database Migrations Management

## Overview
The database schema is now managed through a **consolidated migration system** to ensure all tables are created in the correct dependency order and to avoid initialization failures.

## Migration Strategy

### Single Consolidated File: `000-consolidated-schema.sql`
All database schema changes have been merged into a single, well-organized file located at:
```
/service/database/migrations/000-consolidated-schema.sql
```

This file is organized into logical sections:
1. **Core Tables** - Admin users, sessions, audits, alerts, preferences
2. **Haram Gates Tables** - Gate definitions and hotel-to-gate mappings
3. **Booking Enhancements** - Refund fields, payment status, agent tracking
4. **Payment Links** - Payment link tracking for staff-created bookings
5. **Hotel Enhancements** - Hajj/Umrah specific features, accessibility info
6. **Room Type Enhancements** - Family room configurations
7. **Hotel Best For Tags** - Hotel categorization
8. **Messaging Tables** - Messages and attachments
9. **Email Audit Log** - Email tracking
10. **Default Data** - Initial alert configurations and Haram gates seed data

## Key Benefits

✅ **Single Point of Management** - All schema is in one file, easy to find and update  
✅ **Correct Dependency Order** - All tables are created in proper order with no forward references  
✅ **Idempotent Operations** - Uses `IF NOT EXISTS` for all CREATE statements  
✅ **Self-Healing** - Uses `ADD COLUMN IF NOT EXISTS` for ALTER statements  
✅ **No Ordering Issues** - All migrations run successfully in a single file  
✅ **Built-in Seed Data** - Initial data (Haram gates, admin alerts) included  

## Docker Initialization

The docker-compose.yml is configured to run the consolidated migration:
```yaml
volumes:
  - ./service/database/migrations/000-consolidated-schema.sql:/docker-entrypoint-initdb.d/03-consolidated-schema.sql
```

The initialization order is:
1. `01-init.sql` - Initialize base tables (users, hotels, bookings, etc.)
2. `02-seed.sql` - Seed roles and permissions
3. `03-consolidated-schema.sql` - Create all extension tables and seed data

## Deprecation of Individual Migration Files

The following individual migration files are no longer used by Docker but are kept for reference:
- `001-add-hotel-filters.sql`
- `002-create-admin-users-table.sql`
- `003-create-admin-sessions-table.sql`
- ... and so on through `019-add-hotel-gate-assignments.sql`

These can be archived or deleted once confirmed they're no longer needed.

## Adding New Migrations

When adding new tables or columns:

1. **Add to consolidated file** - Add your changes to `000-consolidated-schema.sql` in the appropriate section
2. **Use IF NOT EXISTS** - Ensure all CREATE statements use `IF NOT EXISTS`
3. **Use ADD IF NOT EXISTS** - For ALTER statements, use `ADD COLUMN IF NOT EXISTS`
4. **Test locally** - Run Docker down/up to ensure schema initializes cleanly
5. **Document changes** - Update this file with a note about what was added

## Example: Adding a New Table

```sql
-- In 000-consolidated-schema.sql, add to appropriate section:

CREATE TABLE IF NOT EXISTS new_table (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reference_id) REFERENCES existing_table(id) ON DELETE CASCADE,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Example: Adding a New Column

```sql
-- In 000-consolidated-schema.sql, in the relevant ALTER section:

ALTER TABLE existing_table ADD COLUMN IF NOT EXISTS new_column VARCHAR(255) NULL;
ALTER TABLE existing_table ADD INDEX IF NOT EXISTS idx_new_column (new_column);
```

## Troubleshooting

### Schema Not Initialized
If Docker container starts but schema isn't created:
1. Remove the volume: `docker-compose down -v`
2. Restart: `docker-compose up -d`

### Column Already Exists
All ALTER statements use `ADD COLUMN IF NOT EXISTS` so this is safe to re-run.

### Foreign Key Constraint Errors
Ensure tables are created in dependency order (they are in the consolidated file).

## Migration History

**Consolidated on**: 2026-04-27

**Migrations merged**:
- 001-add-hotel-filters.sql
- 002-create-admin-users-table.sql
- 003-create-admin-sessions-table.sql
- 004-create-audit-logs-table.sql
- 005-create-admin-alerts-table.sql
- 006-create-alert-history-table.sql
- 007-create-admin-preferences-table.sql
- 008-create-haram-gates-table.sql
- 009-add-booking-source.sql & 009-create-payment-links-table.sql
- 010-add-booking-hold-fields.sql, 010-create-credits-system.sql, 010-create-email-audit-log-table.sql
- 011-add-hajj-umrah-hotel-features.sql & 011-enhance-bookings-table.sql
- 012-add-provider-to-hotels.sql
- 013-add-guest-details-table.sql
- 014-create-messaging-tables.sql
- 015-add-refund-fields.sql
- 016-clarify-booking-status.sql
- 017-add-hotel-rules.sql
- 018-add-custom-policies.sql
- 019-add-hotel-gate-assignments.sql
- seed-hotel-gate-assignments.sql (seed data merged into consolidated file)
