# Codebase Structure

**Last Updated**: 2025-10-20 | **Week**: 10 | **Files**: 70+ | **Tests**: 314 passing

## Project Root

```
vasooly/
├── .expo/                  # Expo build artifacts (gitignored)
├── .github/workflows/      # CI/CD (5 jobs)
├── .serena/               # Serena MCP memory files (gitignored)
├── claudedocs/            # Session documentation (gitignored)
│   └── archive/           # Archived docs (DATABASE_SETUP, UPI_INTEGRATION, TESTING)
├── docs/                  # Project documentation
│   ├── DESIGN_GUIDE.md        # Design principles (keep)
│   ├── IMPLEMENTATION_PLAN.md # 18-week roadmap (keep)
│   ├── VASOOLY_DESIGN_SYSTEM.md # Complete design system
│   ├── SYSTEM_DESIGN.md       # Architecture overview
│   └── UPI_REFERENCE.md       # UPI quick reference
├── e2e/                   # Detox E2E tests (configured)
├── node_modules/          # npm dependencies (gitignored)
├── src/                   # Source code (see below)
├── App.tsx               # App entry point
├── app.json              # Expo configuration
├── babel.config.js       # Babel + Reanimated
├── jest.config.js        # Jest testing
├── package.json          # Dependencies
├── README.md             # Project overview
└── tsconfig.json         # TypeScript (strict)
```

## Source Code (`src/`)

```
src/
├── components/           # Reusable UI (7 components)
│   ├── AnimatedButton.tsx        # Press animations + haptics
│   ├── AnimatedGlassCard.tsx     # Glass card with animations
│   ├── BillAmountInput.tsx       # Currency input
│   ├── GlassCard.tsx             # Glass-morphism container
│   ├── LoadingSpinner.tsx        # Rotating spinner
│   ├── ParticipantList.tsx       # Participant management
│   ├── SplitResultDisplay.tsx    # Split visualization
│   └── index.ts                  # Component exports
│
├── screens/              # UI Screens (5 screens)
│   ├── BillCreateScreen.tsx      # Create/edit bills (~460 lines)
│   ├── BillDetailScreen.tsx      # Bill details + payments (~420 lines)
│   ├── BillHistoryScreen.tsx     # Bill list with search (~390 lines)
│   ├── SettingsScreen.tsx        # App preferences (~460 lines)
│   ├── UPIValidationScreen.tsx   # Testing tool
│   ├── PerformancePOC.tsx        # Performance testing
│   └── index.ts                  # Screen exports
│
├── navigation/           # Navigation configuration
│   ├── AppNavigator.tsx          # Stack Navigator with custom transitions
│   └── index.ts                  # Navigation exports
│
├── lib/                  # Business logic and data
│   ├── business/        # Pure TypeScript business logic
│   │   ├── qrCodeGenerator.ts    # QR code generation (100% coverage)
│   │   ├── splitEngine.ts        # Split calculations (98.52% coverage)
│   │   ├── statusManager.ts      # Payment status (100% coverage)
│   │   ├── upiGenerator.ts       # UPI links (100% coverage)
│   │   └── __tests__/            # Business logic tests
│   │
│   ├── data/            # Database layer (SQLite + SQLCipher)
│   │   ├── billRepository.ts     # Bill CRUD (100% coverage)
│   │   ├── database.ts           # SQLite initialization
│   │   ├── encryption.ts         # Key management (100% coverage)
│   │   ├── migrations.ts         # Schema versioning
│   │   ├── index.ts              # Data layer exports
│   │   └── __tests__/            # Data layer tests
│   │
│   └── platform/        # Platform utilities
│       ├── upiValidation.ts      # UPI device validation
│       └── __tests__/            # Platform tests
│
├── services/            # Native service integrations (4 services)
│   ├── contactsService.ts        # Contact picker (~240 lines, 100% coverage)
│   ├── filePickerService.ts      # Image/PDF picker (~350 lines, 100% coverage)
│   ├── qrCodeService.ts          # QR generation (~290 lines, 100% coverage)
│   ├── shareService.ts           # WhatsApp/SMS (~400 lines, 100% coverage)
│   ├── index.ts                  # Service exports
│   └── __tests__/                # Service tests
│
├── stores/              # Zustand state management (3 stores)
│   ├── billStore.ts              # Bill state + CRUD (~380 lines)
│   ├── historyStore.ts           # Bill history + caching (~250 lines)
│   ├── settingsStore.ts          # App preferences (~220 lines)
│   ├── index.ts                  # Store exports
│   └── __tests__/                # Store tests (100% coverage)
│
├── hooks/               # Custom React hooks (2 hooks)
│   ├── useButtonAnimation.ts     # Button animation logic
│   ├── useHaptics.ts             # Settings-aware haptics
│   └── index.ts                  # Hook exports
│
├── types/               # TypeScript type definitions
│   └── index.ts         # Core domain types
│
├── utils/               # Utility functions
│   ├── animations.ts             # Animation configs + worklets
│   └── index.ts                  # Utility exports
│
└── __tests__/           # Additional test utilities
    └── (test helpers)
```

## Component Architecture

### UI Components (7 components)

**AnimatedButton** (`components/AnimatedButton.tsx`)
- Press animations (scale 0.95, opacity 0.7)
- Settings-aware haptic feedback
- Reanimated worklets on UI thread
- Props: `onPress`, `variant`, `disabled`, `loading`

**AnimatedGlassCard** (`components/AnimatedGlassCard.tsx`)
- Glass-morphism with Skia
- Layout animations with Moti
- Responsive dimensions via `onLayout`
- Props: `children`, `style`, `animateLayout`

**GlassCard** (`components/GlassCard.tsx`)
- Frosted glass effect
- Skia-based blur (60fps)
- Configurable opacity and blur
- Props: `children`, `style`

**LoadingSpinner** (`components/LoadingSpinner.tsx`)
- Smooth rotation (Reanimated)
- Configurable size and color
- Props: `size`, `color`

**BillAmountInput** (`components/BillAmountInput.tsx`)
- Rupee input with validation
- Quick amount buttons
- Inline error display
- Props: `amount`, `onAmountChange`, `error`

**ParticipantList** (`components/ParticipantList.tsx`)
- Add/remove/edit participants
- Duplicate detection
- Minimum enforcement
- Props: `participants`, `onParticipantsChange`, `error`

**SplitResultDisplay** (`components/SplitResultDisplay.tsx`)
- Visual split breakdown
- Per-participant amounts
- Remainder indicators
- Props: `splitResult`

### Screens (5 screens)

**BillHistoryScreen** (`screens/BillHistoryScreen.tsx`)
- FlashList for performance
- historyStore integration
- Pull-to-refresh
- Search functionality
- Filter by status
- Navigate to detail/create

**BillCreateScreen** (`screens/BillCreateScreen.tsx`)
- Bill title + amount input
- Participant management
- Real-time split calculation
- Edit mode support
- billStore integration (Week 10)
- Loading states + validation

**BillDetailScreen** (`screens/BillDetailScreen.tsx`)
- billStore + settingsStore integration
- Animated progress bar
- Payment status toggles
- UPI payment links
- Share functionality
- Edit/Delete actions

**SettingsScreen** (`screens/SettingsScreen.tsx`)
- settingsStore integration
- Default VPA management
- Haptic feedback toggle
- Auto-delete days slider
- Payment reminders
- Reset settings

**UPIValidationScreen** (Testing tool)
- Device UPI validation
- App detection
- Link testing
- Not for production

## Business Logic Modules

### Split Engine (`lib/business/splitEngine.ts`)

**Functions** (8):
- `calculateDetailedSplit()` - Primary MVP split function
- `validateSplitInputs()` - Input validation
- `verifySplitIntegrity()` - Post-calculation verification
- `formatSplitResult()` - UI-ready output
- `splitEqual()` - Basic equal split
- `formatPaise()` - Currency formatting
- `rupeesToPaise()` / `paiseToRupees()` - Conversions

**Coverage**: 98.52% (32 tests)

### Status Manager (`lib/business/statusManager.ts`)

**Functions** (8):
- `isParticipantPaid()`, `isBillSettled()`
- `getSettlementProgress()`, `getPendingParticipants()`
- `markParticipantPaid()`, `markParticipantPending()`
- `markAllPaid()`, `calculatePaymentSummary()`

**Coverage**: 100% (49 tests)

### UPI Generator (`lib/business/upiGenerator.ts`)

**Functions** (6):
- `generateUPILink()` - Standard UPI deep links
- `validateVPA()` - VPA format validation
- `generateTransactionRef()` - Unique references
- `rupeesToPaise()` / `paiseToRupees()`
- App-specific fallback URIs

**Coverage**: 100% (39 tests)

### QR Code Generator (`lib/business/qrCodeGenerator.ts`)

**Functions** (3):
- `generateQRCode()` - Scannable QR codes
- `generateBrandedQRCode()` - Vasooly branding
- `isQRCodeDataValid()` - Capacity validation

**Coverage**: 100% (34 tests)

## Data Layer

### Bill Repository (`lib/data/billRepository.ts`)

**CRUD Operations** (14):
- `createBill()`, `getBills()`, `getBillById()`
- `updateBill()`, `deleteBill()` (soft delete)
- `restoreBill()`, `getDeletedBills()`
- `searchBills()`, `duplicateBill()`
- `updateBillStatus()`, `updateParticipantStatus()`
- `getBillStatistics()`, `cleanupOldDeletedBills()`

**Coverage**: 100% (comprehensive tests)

### Database (`lib/data/database.ts`)

**Features**:
- SQLite with SQLCipher encryption
- 256-bit AES keys (expo-secure-store)
- Migration system with rollback
- Transaction support

**Schema**:
```sql
bills (id, title, total_amount_paise, created_at, updated_at, status, deleted_at)
participants (id, bill_id, name, phone, amount_paise, status, paid_at)
```

## State Management (Zustand)

### Bill Store (`stores/billStore.ts`)

**State**:
- `bills`: Bill[]
- `currentBill`: Bill | null
- `loading`, `error`

**Actions**:
- `createBill()`, `updateBill()`, `deleteBill()`
- `getBillById()`, `loadBills()`
- `markParticipantPaid()`, `markParticipantPending()`

**Persistence**: SQLite via billRepository

### History Store (`stores/historyStore.ts`)

**State**:
- `bills`: Bill[]
- `searchQuery`, `filterStatus`
- `loading`, `error`

**Actions**:
- `loadBills()`, `refreshBills()`
- `setSearchQuery()`, `setFilterStatus()`
- `getFilteredBills()`

**Features**: Search + filter with caching

### Settings Store (`stores/settingsStore.ts`)

**State**:
- `defaultVPA`, `enableHaptics`
- `enableReminders`, `autoDeleteDays`
- `initialized`, `loading`

**Actions**:
- `updateSettings()`, `resetSettings()`
- `loadSettings()`, `saveSettings()`

**Persistence**: SecureStore for VPA, regular storage for others

## Native Services

### Contact Service (`services/contactsService.ts`)

**Functions**:
- `getContactsPermission()` - Permission flow
- `selectContact()`, `selectMultipleContacts()`
- `searchContacts()`

**Coverage**: 100% utilities

### Share Service (`services/shareService.ts`)

**Functions**:
- `shareViaWhatsApp()`, `shareViaSMS()`
- `shareGeneric()`
- Message templates (payment, reminder, summary)

**Coverage**: 100% message generation

### QR Code Service (`services/qrCodeService.ts`)

**Functions**:
- `generateUPIQRCode()` - UPI payment QR
- `generateBrandedQRCode()` - With Vasooly branding
- `generateBatchQRCodes()` - For all participants
- File export with sanitization

**Coverage**: 100% utilities

### File Picker Service (`services/filePickerService.ts`)

**Functions**:
- `pickImage()` - JPEG/PNG selection
- `pickDocument()` - PDF selection
- `pickMultipleImages()`
- File validation (size, type, extension)

**Coverage**: 100% utilities

## Custom Hooks

### useHaptics (`hooks/useHaptics.ts`)

**Features**:
- Settings-aware (respects `enableHaptics`)
- 7 types: light, medium, heavy, success, warning, error, selection
- Graceful degradation on unsupported devices

### useButtonAnimation (`hooks/useButtonAnimation.ts`)

**Features**:
- Reusable button press animation
- Scale + opacity transition
- Spring animation config

## Utilities

### Animations (`utils/animations.ts`)

**Spring Configs**:
- `gentle`, `bouncy`, `snappy`, `smooth`

**Timing Configs**:
- `quick`, `standard`, `slow`, `linear`

**Worklets**:
- `buttonPressAnimation`, `statusChangeAnimation`
- `progressAnimation`, `fadeAnimation`
- `slideAnimation`, `celebrationAnimation`

## Type System (`types/index.ts`)

**Core Types**:
```typescript
Bill, Participant, BillStatus, PaymentStatus
SplitResult, DetailedSplitResult, ParticipantSplit
UPIPaymentParams, UPILinkResult
QRCodeOptions, QRCodeResult
Settings, BillStatistics
```

## Testing Structure

**Test Suites** (314 tests):
- Business logic: 98.52-100% coverage
- Data layer: 100% coverage
- Services: 100% utilities coverage
- Stores: 100% coverage
- Total: 314 passing tests

**Test Commands**:
```bash
npm test                # Run all tests
npm run test:coverage   # With coverage
npm run test:watch      # Watch mode
```

## Configuration Files

**TypeScript** (`tsconfig.json`):
- Strict mode enabled
- Path aliases: `@/*` → `src/*`

**ESLint** (`eslint.config.mjs`):
- ESLint v9 + TypeScript
- 0 errors, 14 acceptable warnings

**Jest** (`jest.config.js`):
- jest-expo preset
- Coverage thresholds (90%+)

**Babel** (`babel.config.js`):
- Reanimated plugin
- Module resolver for aliases

## Dependencies

**Core** (48 packages):
- react-native 0.76.1
- expo SDK 54
- typescript 5.9.2
- zustand 5.0.8

**Animations**:
- react-native-reanimated 4.1.3
- moti 0.30.0
- @shopify/react-native-skia 2.3.0

**Database**:
- expo-sqlite 16.0.8 (SQLCipher)
- expo-secure-store 15.0.7

**Navigation**:
- @react-navigation/native 7.0.14
- @react-navigation/stack 7.1.5

**Performance**:
- @shopify/flash-list 2.1.0

**Testing**:
- jest 30.2.0
- @testing-library/react-native 13.3.3

## Code Metrics

**Lines of Code**: ~13,000+ total
- Production: ~8,000 lines
- Tests: ~3,500 lines
- Config: ~800 lines

**Files**: 70+ files
- Source: 35
- Tests: 20
- Config: 10
- Documentation: 5+

**Quality**:
- TypeScript: 0 errors
- ESLint: 0 errors
- Tests: 314 passing
- Coverage: 100% on critical paths

---

**Last Updated**: 2025-10-20 | **Week**: 10 | **Status**: Phase 2 IN PROGRESS
