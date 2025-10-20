# Development Guide

## Technology Stack

### Core Framework
- **Framework**: React Native 0.76.1 with Expo SDK 54
- **Language**: TypeScript 5.9.2 (strict mode enabled)
- **Runtime**: React 19.1.0
- **Platform**: iOS + Android

### State & Data
- **State Management**: Zustand 5.0.8 (lightweight, TypeScript-first)
- **Database**: expo-sqlite 16.0.8 with SQLCipher encryption
- **Encryption**: 256-bit AES keys via expo-secure-store 15.0.7
- **Why**: ACID compliance, encrypted, offline-first

### Animation & Performance
- **Animations**: react-native-reanimated 4.1.3 + moti 0.30.0
- **Graphics**: @shopify/react-native-skia 2.3.0 (glass effects)
- **Lists**: @shopify/flash-list 2.1.0 (virtualized rendering)
- **Gestures**: react-native-gesture-handler 2.28.0
- **Why**: 60fps worklets on UI thread

### Navigation
- **Router**: @react-navigation/stack (custom animations)
- **Why**: Smooth transitions with Reanimated integration

### Native Services
- **Contacts**: expo-contacts 15.0.9
- **Sharing**: expo-sharing 14.0.7
- **Documents**: expo-document-picker 14.0.7
- **Haptics**: expo-haptics 15.0.7
- **QR Codes**: react-native-qrcode-svg 6.3.15
- **SVG**: react-native-svg 15.12.1
- **Device Info**: expo-device 8.0.9

### Testing & Quality
- **Unit Tests**: jest 30.2.0 + jest-expo 54.0.12
- **React Testing**: @testing-library/react-native 13.3.3
- **Linting**: ESLint 9.37.0 + @typescript-eslint 8.46.1
- **Coverage**: 314 passing tests, 100% on critical paths

## Code Style & Conventions

### TypeScript Configuration
- **Strict Mode**: Enabled (`"strict": true`)
- **Path Aliases**: `@/*` maps to `src/*`
- **Target**: ESNext (latest features)
- **Module**: ES modules
- **JSX**: React JSX

### Naming Conventions

**Files & Directories**:
- **Components**: PascalCase (e.g., `GlassCard.tsx`, `BillHistoryScreen.tsx`)
- **Business Logic**: camelCase (e.g., `splitEngine.ts`, `upiGenerator.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx` (same name as source file)
- **Config Files**: lowercase with dots (e.g., `jest.config.js`)

**Code Conventions**:
- **Functions**: camelCase (e.g., `splitEqual`, `generateUPILink`)
- **Interfaces**: PascalCase (e.g., `SplitResult`, `Bill`)
- **Enums**: PascalCase (e.g., `BillStatus`, `PaymentStatus`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_RETENTION_DAYS`)

### Directory Structure

```
src/
├── screens/          # UI screens (PascalCase)
├── components/       # Reusable UI components (PascalCase)
├── navigation/       # Navigation configuration
├── lib/
│   ├── business/    # Business logic (camelCase)
│   ├── data/        # Database layer (camelCase)
│   └── platform/    # Native modules (camelCase)
├── services/        # Native service integrations
├── stores/          # Zustand stores (camelCase)
├── hooks/           # Custom React hooks (camelCase)
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

### Documentation Standards

**JSDoc Comments** (Required for all exported functions):
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

**Inline Comments**:
- Explain WHY, not WHAT
- Use for complex algorithms or non-obvious decisions
- Example: `// Distribute remainder to first shares`

### ESLint Rules

**Enforced**:
- `@typescript-eslint/no-unused-vars: error` (allow `_` prefix for ignored)
- `@typescript-eslint/no-explicit-any: warn` (discourage `any`)

**Ignored Paths**: node_modules/, dist/, .expo/, coverage/

### Testing Conventions

**Test Structure**:
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

**Coverage Requirements**:
- **Business Logic**: 100% required
- **Data Layer**: 100% required
- **Services**: 100% utilities coverage
- **UI Components**: Best effort

### Import Order

1. React imports
2. React Native imports
3. Third-party libraries (alphabetical)
4. Internal modules (alphabetical, use `@/` alias)
5. Types (separate from values)

**Example**:
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { format } from 'date-fns';

import { splitEqual } from '@/lib/business/splitEngine';
import { useBillStore } from '@/stores/billStore';
import type { Bill } from '@/types';
```

### Error Handling

**Validation**:
- Throw descriptive errors for invalid inputs
- Example: `throw new Error('Count must be greater than 0')`
- Use Zod for complex validation schemas

**Async Errors**:
- Always handle promise rejections
- Use try-catch for async functions
- Log errors with context

### Performance Guidelines

**Animation Code**:
- Use `'worklet'` directive for Reanimated functions
- Avoid computations on UI thread
- Memoize expensive calculations

**Lists**:
- Use FlashList, not FlatList
- Memoize list items
- Implement proper keyExtractor

**Database**:
- Use transactions for batch operations
- Index frequently queried columns
- Avoid N+1 queries

## Development Workflow

### Daily Workflow
1. `git pull origin main` - Get latest changes
2. `git checkout -b feature/xyz` - Create feature branch
3. `npm start` - Start dev server
4. Write code + tests
5. `npm run validate` - Check quality
6. `git commit` - Commit changes
7. Test on device (scan QR from Expo Go)

### Quality Validation (MANDATORY Before Commit)
```bash
npm run validate  # Runs: typecheck && lint && test:coverage
```

**Rule**: Never commit without green validate check!

### Git Commit Format
```
type: brief description (50 chars max)

Detailed explanation if needed (wrap at 72 chars)

- Bullet points for details
- What changed and why
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Testing Commands
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
npm run test:ci             # CI mode
```

### Code Quality Commands
```bash
npm run typecheck           # TypeScript check
npm run lint                # ESLint check
npm run lint:fix            # Auto-fix issues
```

## Best Practices

### DO
- Use path aliases (`@/` for imports)
- Write JSDoc for exported functions
- Follow naming conventions
- Keep functions small and focused
- Test business logic thoroughly
- Use TypeScript strict mode
- Handle errors gracefully
- Memoize expensive operations

### DON'T
- Use `any` type (use `unknown` if needed)
- Skip validation checks
- Commit without running `npm run validate`
- Mix naming conventions
- Duplicate code (DRY principle)
- Ignore ESLint warnings
- Write long functions (>50 lines)
- Skip error handling

## Architecture Principles

1. **Clean Architecture**: Separation of UI, business logic, data
2. **Framework Agnostic Core**: Business logic independent of React Native
3. **Testability First**: Pure functions, dependency injection
4. **Performance by Design**: Optimized rendering, lazy loading
5. **Type Safety**: Strict TypeScript, no `any` types
6. **Offline First**: Local storage with SQLite persistence
7. **Settings-Aware**: Respect user preferences (haptics, etc.)

## Project Structure Highlights

**Screens** (5):
- BillHistoryScreen - Bill list with search
- BillCreateScreen - Create/edit bills
- BillDetailScreen - Bill details + payments
- SettingsScreen - App preferences
- UPIValidationScreen - Testing tool

**Core Components** (7):
- GlassCard, AnimatedButton, LoadingSpinner
- BillAmountInput, ParticipantList, SplitResultDisplay
- AnimatedGlassCard

**Business Logic** (3 modules):
- splitEngine - Bill splitting calculations
- statusManager - Payment status tracking
- upiGenerator - UPI link generation

**Services** (4 native integrations):
- contactsService - Contact picker
- shareService - WhatsApp/SMS sharing
- qrCodeService - QR code generation
- filePickerService - Image/PDF selection

**Stores** (3 Zustand):
- billStore - Bill state management
- historyStore - Bill history with caching
- settingsStore - App preferences

## Quality Metrics

- **TypeScript**: 100% strict mode compliance
- **ESLint**: 0 errors (14 acceptable warnings)
- **Tests**: 314 passing, 100% coverage on critical paths
- **CI/CD**: 5 automated jobs on GitHub Actions

---

**Last Updated**: 2025-10-20 | **Status**: Week 10 Complete
