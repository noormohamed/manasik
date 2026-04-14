# Features Directory

This directory contains all service-specific features. Each feature is completely isolated and self-contained, following a consistent structure.

## Structure

Each feature folder contains:

```
feature-name/
├── models/              # Data models specific to this feature
│   ├── model1.ts
│   ├── model2.ts
│   └── index.ts        # Exports all models
├── handlers/           # Request handlers for CRUD operations
│   ├── handler1.ts
│   ├── handler2.ts
│   └── index.ts        # Exports all handlers
├── services/           # Business logic and complex operations
│   ├── service.ts
│   └── index.ts        # Exports all services
├── types/              # TypeScript types and interfaces
│   └── index.ts        # Exports all types
├── index.ts            # Main export file
└── README.md           # Feature documentation
```

## Features

### Hotel
Complete hotel booking system with room management, bookings, and reviews.

**Location**: `hotel/`

**Exports**:
```typescript
import {
  Hotel,
  RoomType,
  HotelBooking,
  HotelReview,
  HotelHandler,
  RoomTypeHandler,
  HotelBookingHandler,
  HotelReviewHandler,
  HotelService,
  HotelStatus,
  RoomTypeStatus,
  HotelLocation,
  HotelBookingMetadata,
  HotelReviewCriteria
} from '@/features/hotel';
```

## Adding a New Feature

### Step 1: Create Folder Structure

```bash
mkdir -p src/features/feature-name/{models,handlers,services,types}
```

### Step 2: Create Types

Define all TypeScript types and interfaces in `types/index.ts`:

```typescript
// src/features/feature-name/types/index.ts
export type FeatureStatus = 'ACTIVE' | 'INACTIVE';

export interface FeatureMetadata {
  // Feature-specific fields
}

export interface FeatureReviewCriteria {
  // Review criteria
}
```

### Step 3: Create Models

Extend base classes from core models:

```typescript
// src/features/feature-name/models/feature.ts
import { BaseBooking } from '../../../models/booking/base-booking';
import { BaseReview } from '../../../models/review/base-review';

export class FeatureBooking extends BaseBooking {
  validate(): boolean {
    // Feature-specific validation
    return true;
  }
}

export class FeatureReview extends BaseReview {
  validate(): boolean {
    // Feature-specific validation
    return true;
  }
}
```

Export all models from `models/index.ts`:

```typescript
// src/features/feature-name/models/index.ts
export { FeatureBooking } from './feature-booking';
export { FeatureReview } from './feature-review';
```

### Step 4: Create Handlers

Create handlers for CRUD operations:

```typescript
// src/features/feature-name/handlers/feature.handler.ts
export class FeatureHandler {
  async create(params: any): Promise<Feature> {
    // Implementation
  }

  async get(id: string): Promise<Feature | null> {
    // Implementation
  }

  async list(filters: any): Promise<{ items: Feature[]; total: number }> {
    // Implementation
  }

  async update(id: string, updates: any): Promise<Feature> {
    // Implementation
  }

  async delete(id: string): Promise<boolean> {
    // Implementation
  }
}
```

Export all handlers from `handlers/index.ts`:

```typescript
// src/features/feature-name/handlers/index.ts
export { FeatureHandler } from './feature.handler';
export { FeatureBookingHandler } from './feature-booking.handler';
export { FeatureReviewHandler } from './feature-review.handler';
```

### Step 5: Create Services

Create services for business logic:

```typescript
// src/features/feature-name/services/feature.service.ts
export class FeatureService {
  private handler: FeatureHandler;

  constructor() {
    this.handler = new FeatureHandler();
  }

  async getWithDetails(id: string): Promise<any> {
    // Complex business logic
  }

  async search(criteria: any): Promise<any[]> {
    // Search logic
  }
}
```

Export all services from `services/index.ts`:

```typescript
// src/features/feature-name/services/index.ts
export { FeatureService } from './feature.service';
```

### Step 6: Create Main Export

```typescript
// src/features/feature-name/index.ts
export * from './models';
export * from './handlers';
export * from './services';
export * from './types';
```

### Step 7: Create Documentation

```markdown
# Feature Name

Brief description of the feature.

## Structure

Explain the folder structure.

## Usage

Provide usage examples.

## Models

Document each model.

## Handlers

Document each handler.

## Service

Document the service.

## Types

List all exported types.

## Next Steps

List what needs to be done next.
```

## Best Practices

1. **Isolation**: Keep feature code completely isolated. Don't import from other features.
2. **Consistency**: Follow the same structure for all features.
3. **Documentation**: Document each feature with a README.
4. **Exports**: Always export from index.ts files for clean imports.
5. **Types**: Define all types in the types folder.
6. **Validation**: Implement validation in models.
7. **Error Handling**: Use consistent error handling patterns.
8. **Testing**: Create tests alongside models and handlers.

## Importing Features

### From Core Application

```typescript
// Import entire feature
import { Hotel, HotelHandler, HotelService } from '@/features/hotel';

// Import specific items
import { Hotel, RoomType } from '@/features/hotel';
import { HotelHandler } from '@/features/hotel';
```

### From Other Features

**Avoid importing from other features.** If you need shared logic, move it to the core models or create a shared utility.

## Feature Lifecycle

1. **Create**: Create feature folder and structure
2. **Develop**: Implement models, handlers, and services
3. **Test**: Write unit and integration tests
4. **Document**: Create comprehensive README
5. **Integrate**: Add API routes and middleware
6. **Deploy**: Deploy to production
7. **Monitor**: Monitor performance and errors
8. **Maintain**: Fix bugs and add features

## Common Patterns

### Chaining Setters
```typescript
feature
  .setName('New Name')
  .setDescription('New Description')
  .setStatus('ACTIVE');
```

### Validation
```typescript
try {
  booking.validate();
  // Proceed
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Status Transitions
```typescript
booking.setStatus('PENDING');
// ... processing ...
booking.setStatus('CONFIRMED');
```

### Metadata Access
```typescript
const meta = booking.getMetadata();
console.log(meta.customField);
```

## Troubleshooting

### Import Errors
Make sure you're importing from the feature's index.ts file, not directly from subfolders.

### Circular Dependencies
Avoid importing from other features. Use core models instead.

### Type Errors
Ensure all types are properly exported from types/index.ts.

## Future Features

Planned features to be added:

- [ ] Taxi
- [ ] Experience
- [ ] Car Rental
- [ ] Food
- [ ] Flight
- [ ] Activity
- [ ] Tour
- [ ] Accommodation

Each will follow the same structure and patterns.
