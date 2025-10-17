# Codebase Structure

## Project Root

```
vasooly/
├── .expo/                  # Expo build artifacts (gitignored)
├── .github/                # GitHub workflows (CI/CD)
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline (5 jobs)
├── .serena/               # Serena MCP memory files (gitignored)
├── claudedocs/            # Session documentation (gitignored)
├── docs/                  # Project documentation
│   ├── ANDROIDMANIFEST_QUERIES.md
│   ├── DATABASE_SETUP.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── SOFT_DELETE_GUIDE.md
│   ├── SYSTEM_DESIGN.md
│   ├── TESTING.md
│   └── UPI_INTEGRATION.md
├── e2e/                   # Detox E2E tests
│   └── firstTest.test.js
├── node_modules/          # npm dependencies (gitignored)
├── src/                   # Source code (see detailed structure below)
├── .detoxrc.js           # Detox E2E configuration
├── .eslintrc.json        # ESLint v9 configuration
├── .gitignore            # Git ignore rules
├── App.tsx               # App entry point (displays BillCreateScreen)
├── app.json              # Expo configuration
├── babel.config.js       # Babel with Reanimated plugin
├── jest.config.js        # Jest testing configuration
├── package-lock.json     # npm lock file
├── package.json          # Dependencies and scripts
├── PROJECT_STATUS.md     # Current project status
├── README.md             # Project overview
└── tsconfig.json         # TypeScript configuration (strict mode)
```

## Source Code Structure (`src/`)

```
src/
├── components/           # Reusable UI components ✅
│   ├── BillAmountInput.tsx        # Amount entry with quick buttons (~180 lines)
│   ├── GlassCard.tsx              # Glass-morphism card component
│   ├── ParticipantList.tsx        # Participant management (~280 lines)
│   ├── SplitResultDisplay.tsx     # Split breakdown display (~220 lines)
│   └── index.ts                   # Component exports
│
├── screens/              # UI screens ✅
│   ├── BillCreateScreen.tsx       # Bill creation workflow (~355 lines)
│   ├── PerformancePOC.tsx         # Performance testing screen
│   ├── UPIValidationScreen.tsx    # UPI validation testing
│   └── index.ts                   # Screen exports
│
├── lib/                  # Business logic and services
│   ├── business/        # Business logic (Pure TypeScript) ✅
│   │   ├── qrCodeGenerator.ts     # QR code generation
│   │   ├── splitEngine.ts         # Split calculation engine (enhanced)
│   │   ├── upiGenerator.ts        # UPI link generation
│   │   └── __tests__/
│   │       ├── qrCodeGenerator.test.ts
│   │       ├── splitEngine.test.ts (32 tests, 98.52% coverage)
│   │       └── upiGenerator.test.ts
│   │
│   ├── data/            # Database layer (SQLite + SQLCipher) ✅
│   │   ├── billRepository.ts      # Bill CRUD operations
│   │   ├── database.ts            # SQLite initialization
│   │   ├── encryption.ts          # Key management
│   │   ├── index.ts               # Data layer exports
│   │   ├── migrations.ts          # Schema versioning
│   │   └── __tests__/
│   │       ├── billRepository.test.ts
│   │       └── encryption.test.ts
│   │
│   └── platform/        # Native modules (Expo) ✅
│       ├── upiValidation.ts       # UPI validation framework
│       └── __tests__/
│           └── upiValidation.test.ts
│
├── stores/              # Zustand state management (planned)
│   └── (empty - Week 5 implementation)
│
├── types/               # TypeScript type definitions ✅
│   └── index.ts         # Core domain types (Bill, Participant, etc.)
│
├── utils/               # Utility functions (planned)
│   └── (empty - to be added as needed)
│
└── __tests__/           # Additional test files
    └── (test utilities and helpers)
```

## Component Architecture

### UI Components (4 components)

**BillAmountInput** (`src/components/BillAmountInput.tsx`)
- Purpose: Rupee input with paise conversion
- Features: Quick amount buttons, inline validation
- Props: `amount`, `onAmountChange`, `error`
- Lines: ~180

**ParticipantList** (`src/components/ParticipantList.tsx`)
- Purpose: Add/remove/edit participants
- Features: Avatar UI, duplicate detection, minimum enforcement
- Props: `participants`, `onParticipantsChange`, `minParticipants`, `error`
- Lines: ~280

**SplitResultDisplay** (`src/components/SplitResultDisplay.tsx`)
- Purpose: Display split breakdown
- Features: Per-participant amounts, remainder indicators, summary stats
- Props: `splitResult`
- Lines: ~220

**GlassCard** (`src/components/GlassCard.tsx`)
- Purpose: Glass-morphism design system component
- Features: Skia glass effects, Moti animations
- Variants: GlassCard, AnimatedGlassCard
- Lines: ~180

### Screens (3 screens)

**BillCreateScreen** (`src/screens/BillCreateScreen.tsx`)
- Purpose: Complete bill creation workflow
- Features: Title input, amount entry, participant management, real-time split calculation, database integration
- Integrations: BillAmountInput, ParticipantList, SplitResultDisplay, splitEngine, billRepository
- Lines: ~355

**UPIValidationScreen** (`src/screens/UPIValidationScreen.tsx`)
- Purpose: Device testing for UPI validation
- Features: UPI app detection, link testing, QR code generation
- Status: Testing tool (not production)
- Lines: ~500

**PerformancePOC** (`src/screens/PerformancePOC.tsx`)
- Purpose: Performance testing for 60fps animations
- Features: GlassCard showcase, animation testing
- Status: Testing tool (not production)
- Lines: ~200

## Business Logic Modules

### Split Engine (`src/lib/business/splitEngine.ts`)

**Core Functions**:
- `calculateDetailedSplit()` - Primary MVP function for participant-aware splitting
- `validateSplitInputs()` - Comprehensive input validation
- `verifySplitIntegrity()` - Post-calculation verification
- `formatSplitResult()` - UI-ready formatted output
- `splitEqual()` - Basic equal split algorithm
- `calculateSplit()` - Legacy split function
- `formatPaise()` - Currency formatting
- `rupeesToPaise()` - Unit conversion

**Types**:
- `ParticipantSplit` - Per-participant split result
- `DetailedSplitResult` - Complete split metadata
- `SplitResult` - Legacy split result
- `SplitValidationError` - Custom error class

**Test Coverage**: 32 tests, 98.52% coverage

### UPI Generator (`src/lib/business/upiGenerator.ts`)

**Core Functions**:
- `generateUPILink()` - Standard UPI deep link generation
- `validateVPA()` - VPA format validation
- `generateTransactionRef()` - Unique transaction references
- `rupeesToPaise()` / `paiseToRupees()` - Amount conversion

**Test Coverage**: 100%

### QR Code Generator (`src/lib/business/qrCodeGenerator.ts`)

**Core Functions**:
- `generateQRCode()` - Scannable QR codes
- `generateBrandedQRCode()` - Vasooly-branded QR codes
- `isQRCodeDataValid()` - QR capacity validation

**Test Coverage**: 100%

## Database Layer

### Bill Repository (`src/lib/data/billRepository.ts`)

**CRUD Operations**:
- `createBill(bill: Bill): Promise<void>`
- `getBills(): Promise<Bill[]>`
- `getBillById(id: string): Promise<Bill | null>`
- `updateBill(bill: Bill): Promise<void>`
- `deleteBill(id: string): Promise<void>` (soft delete)
- `restoreBill(id: string): Promise<void>`
- `getDeletedBills(): Promise<Bill[]>`
- `cleanupOldDeletedBills(days: number): Promise<void>`

**Features**:
- Transaction-safe operations
- Soft delete with restore
- Foreign key constraints
- Bill + Participants atomic creation

**Test Coverage**: 100%

### Database (`src/lib/data/database.ts`)

**Features**:
- SQLite with SQLCipher encryption
- 256-bit AES encryption keys
- OS Keychain integration (expo-secure-store)
- Migration system with rollback
- Transaction support

**Schema**:
```sql
bills (id, title, total_amount_paise, created_at, updated_at, status, deleted_at)
participants (id, bill_id, name, phone, amount_paise, status)
```

## Type System (`src/types/index.ts`)

**Core Types**:
```typescript
interface Bill {
  id: string;
  title: string;
  totalAmountPaise: number;
  createdAt: Date;
  updatedAt: Date;
  participants: Participant[];
  status: BillStatus;
}

interface Participant {
  id: string;
  name: string;
  phone?: string;
  amountPaise: number;
  status: PaymentStatus;
}

enum BillStatus {
  ACTIVE = 'ACTIVE',
  SETTLED = 'SETTLED',
  DELETED = 'DELETED',
}

enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}
```

## Testing Structure

**Test Suites** (7 suites, 130+ tests):
1. Split Engine Tests (32 tests) - 98.52% coverage
2. UPI Generator Tests - 100% coverage
3. QR Code Generator Tests - 100% coverage
4. Bill Repository Tests - 100% coverage
5. Database Encryption Tests - 100% coverage
6. UPI Validation Tests - 100% coverage
7. Integration Tests

**Test Commands**:
```bash
npm test                # Run all tests
npm run test:coverage   # With coverage report
npm run test:watch      # Watch mode
npm run test:ci         # CI mode
```

## Configuration Files

**TypeScript** (`tsconfig.json`):
- Strict mode enabled
- Path aliases: `@/*` → `src/*`
- Target: ESNext
- Module: ES modules

**ESLint** (`eslint.config.mjs`):
- ESLint v9 with TypeScript support
- Expo config as base
- TypeScript rules enabled
- No unused vars enforcement

**Jest** (`jest.config.js`):
- jest-expo preset
- TypeScript transformation
- Coverage thresholds (90%+)
- Test match patterns

**Babel** (`babel.config.js`):
- babel-preset-expo
- Reanimated plugin enabled
- Module resolver for path aliases

## Documentation

**Core Docs** (7 documents):
1. `PROJECT_STATUS.md` - Current progress and status
2. `README.md` - Project overview and quick start
3. `docs/SYSTEM_DESIGN.md` - Architecture and design decisions
4. `docs/IMPLEMENTATION_PLAN.md` - 18-week roadmap
5. `docs/DATABASE_SETUP.md` - SQLCipher encryption guide
6. `docs/UPI_INTEGRATION.md` - UPI implementation details
7. `docs/TESTING.md` - Testing strategy and guides

**Additional Docs**:
- `docs/SOFT_DELETE_GUIDE.md` - Soft delete implementation
- `docs/ANDROIDMANIFEST_QUERIES.md` - Android package visibility

## Dependencies

**Core** (52 packages):
- react-native 0.81.4
- expo SDK 54
- typescript 5.9.2
- zustand 5.0.8 (not yet used)
- date-fns 4.1.0

**Animations**:
- react-native-reanimated 4.1.3
- moti 0.30.0
- @shopify/react-native-skia 2.3.0
- react-native-gesture-handler 2.28.0

**Database**:
- expo-sqlite 16.0.8 (SQLCipher)
- expo-secure-store 15.0.7

**Native Modules**:
- expo-contacts 15.0.9 (not yet used)
- expo-sharing 14.0.7 (not yet used)
- expo-document-picker 14.0.7 (not yet used)
- expo-haptics 15.0.7 (not yet used)
- react-native-qrcode-svg 6.3.15
- react-native-svg 15.14.0
- expo-device 8.0.9

**Testing**:
- jest 30.2.0
- @testing-library/react-native 13.3.3
- detox (configured, not yet used)

## Code Metrics

**Lines of Code**: ~8,235 total
- Production code: ~6,500 lines
- Test code: ~1,200 lines
- Configuration: ~535 lines

**Files Created**: 52 files
- Source files: 20
- Test files: 10
- Component files: 4
- Screen files: 3
- Config files: 8
- Documentation: 7

**Test Coverage**:
- Split engine: 98.52%
- Data layer: 100%
- UPI integration: 100%
- Overall: ~95%

## Architecture Patterns

**Clean Architecture**:
```
Presentation (React Native) → State (Zustand) → Business Logic → Data Access → Platform Services
```

**Separation of Concerns**:
- UI components (presentation only)
- Business logic (pure TypeScript, framework-agnostic)
- Data layer (database abstraction)
- Platform services (native module wrappers)

**Type Safety**:
- Strict TypeScript mode
- Interface-driven design
- Type guards for validation
- No `any` types (except in tests)

**Testing Strategy**:
- Unit tests for business logic (90%+ coverage)
- Integration tests for database layer (100% coverage)
- Component tests (planned for Week 4)
- E2E tests with Detox (configured, not yet implemented)

## What's Ready for Week 4

**Ready Components**:
- ✅ BillCreateScreen (fully functional)
- ✅ Split engine (enhanced, tested)
- ✅ Database layer (CRUD complete)
- ✅ UPI generator (tested on 1 device)
- ✅ QR code generator (functional)
- ✅ Glass-morphism design system

**Can Build Next**:
- Bill History screen (list all bills)
- Bill Detail screen (show one bill with UPI links)
- Edit/Delete bill functionality
- Duplicate bill feature
- Search and filter

**Dependencies Available**:
- ✅ billRepository (getBills, getBillById, etc.)
- ✅ Split engine (calculateDetailedSplit)
- ✅ UPI generator (generateUPILink)
- ✅ QR generator (generateQRCode)
- ✅ Types (Bill, Participant, BillStatus)
- ✅ Design components (GlassCard, theme)
