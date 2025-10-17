# Code Style & Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled (`"strict": true`)
- **Path Aliases**: `@/*` maps to `src/*`
- **Target**: ESNext (latest features)
- **Module**: ES modules
- **JSX**: React JSX

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `GlassCard.tsx`, `UPIValidationScreen.tsx`)
- **Business Logic**: camelCase (e.g., `splitEngine.ts`, `upiGenerator.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx` (same name as source file)
- **Config Files**: lowercase with dots (e.g., `jest.config.js`, `.detoxrc.js`)

### Code Conventions
- **Functions**: camelCase (e.g., `splitEqual`, `generateUPILink`, `formatPaise`)
- **Interfaces**: PascalCase (e.g., `SplitResult`, `Bill`, `Participant`)
- **Enums**: PascalCase (e.g., `BillStatus`, `PaymentStatus`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_RETENTION_DAYS`)
- **Private vars**: No underscore prefix (use TypeScript `private`)

## Code Organization

### Directory Structure
```
src/
├── screens/          # UI screens (PascalCase)
├── components/       # Reusable UI components (PascalCase)
├── lib/
│   ├── business/    # Business logic (camelCase)
│   ├── data/        # Database layer (camelCase)
│   └── platform/    # Native modules (camelCase)
├── stores/          # Zustand stores (camelCase)
├── types/           # TypeScript types (index.ts)
├── utils/           # Utility functions (camelCase)
└── __tests__/       # Tests (mirrors src structure)
```

### File Organization (Clean Architecture)
1. **Imports** (grouped: React, third-party, internal)
2. **Types/Interfaces** (before functions that use them)
3. **Constants** (if any)
4. **Functions** (exported functions first, helpers after)
5. **Exports** (default export last for components)

## Documentation Standards

### JSDoc Comments
- **Required**: All exported functions
- **Format**: 
  ```typescript
  /**
   * Brief description of function
   * Detailed explanation if needed
   * 
   * @param paramName - Description
   * @returns Description
   * @throws Error description (if applicable)
   */
  ```
- **Example**: See `src/lib/business/splitEngine.ts`

### File Headers
- Include purpose comment at top of complex files
- Example: `"Split Engine - Core business logic for bill splitting"`

### Inline Comments
- Explain WHY, not WHAT
- Use for complex algorithms or non-obvious decisions
- Example: `// Distribute remainder to first shares`

## ESLint Rules (eslint.config.mjs)

### Enforced Rules
- `@typescript-eslint/no-unused-vars: error` (allow `_` prefix for ignored)
- `@typescript-eslint/no-explicit-any: warn` (discourage `any`)
- `@typescript-eslint/explicit-function-return-type: off` (type inference OK)
- `@typescript-eslint/explicit-module-boundary-types: off` (flexibility)

### Ignored Paths
- `node_modules/`
- `dist/`
- `.expo/`
- `coverage/`

## Testing Conventions

### Test Structure
```typescript
describe('FunctionName', () => {
  it('should do expected behavior', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe(...);
  });
});
```

### Test Coverage Requirements
- **Business Logic**: 100% coverage required
- **Data Layer**: 100% coverage required
- **UI Components**: Best effort (not required for Phase 0)
- **Integration**: E2E tests for critical flows

## Error Handling

### Validation
- Throw descriptive errors for invalid inputs
- Example: `throw new Error('Count must be greater than 0')`
- Use Zod for complex validation schemas

### Async Errors
- Always handle promise rejections
- Use try-catch for async functions
- Log errors with context

## Performance Guidelines

### Animation Code
- Use `'worklet'` directive for Reanimated functions
- Avoid computations on UI thread
- Memoize expensive calculations

### Lists
- Use FlashList, not FlatList
- Memoize list items
- Implement proper keyExtractor

### Database
- Use transactions for batch operations
- Index frequently queried columns
- Avoid N+1 queries

## Import Order
1. React imports
2. React Native imports
3. Third-party libraries (alphabetical)
4. Internal modules (alphabetical, use `@/` alias)
5. Types (separate from values)

Example:
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { format } from 'date-fns';

import { splitEqual } from '@/lib/business/splitEngine';
import { useBillStore } from '@/stores/billStore';
import type { Bill } from '@/types';
```
