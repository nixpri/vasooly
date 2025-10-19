# Vasooly Project Overview

## Purpose
Vasooly is a **mobile-first UPI bill splitting application** for the Indian market that enables:
- 60-second bill splits from app launch to shared payment links
- Zero-install payments via UPI deep links (recipients don't need the app)
- Complete offline operation with local-first architecture
- CRED-like premium UX with 60fps animations and glass effects
- Privacy-focused design with encrypted local storage

**Target**: iOS + Android from single React Native codebase
**Market**: Indian B2C, freemium model with Pro features
**Timeline**: 18 weeks to production-ready

## Current Status
**Phase**: Phase 2 IN PROGRESS (Week 7 Complete!)
**Week**: 7/18 complete (38.9% progress)
**Tests**: 251 passing tests with 100% coverage on critical paths
**Documentation**: 13 core documents complete
**Device Testing**: 1/10 devices validated (OnePlus 13 - PASS)

## Phase Progress

### Phase 0: Foundation & De-risking ✅ COMPLETE
**Weeks 1-2**: Security, encryption, POCs
- ✅ Database encryption (SQLCipher + expo-secure-store)
- ✅ UPI validation framework with device testing
- ✅ 60fps glass effects POC
- ✅ Testing infrastructure (104 tests, CI/CD)

### Phase 1: Core Development ✅ COMPLETE
**Weeks 3-6**: Features, business logic, basic UI
- ✅ Week 3: Split Engine Enhancement (98.52% coverage)
- ✅ Week 4: Bill History & Management (FlashList, navigation)
- ✅ Week 5: UPI Generator + Status Manager (100% coverage)
- ✅ Week 6: Basic UI (Bill Create Screen - completed during Week 3-4)

**Phase 1 Achievements**:
- 176 → 251 passing tests (100% coverage on critical paths)
- 4 reusable UI components (glass-morphism design)
- 3 complete screens (Create, History, Detail)
- Complete bill management workflow (Create → History → Detail → Edit)
- Payment status tracking with Status Manager (8 functions)
- UPI link generation with 17+ app support

### Phase 2: Integration & Polish 🔄 IN PROGRESS
**Weeks 7-10**: Native modules, animations, UX
- ✅ Week 7: Native Modules Integration (COMPLETE!)
- ⏳ Week 8: State Management (Next)
- ⏳ Week 9: Complete UI Flows (Pending)
- ⏳ Week 10: Animations & Polish (Pending)

**Week 7 Achievements** (Native Services Layer):
- ✅ 4 production services (~1,280 lines)
- ✅ Contact Service with permission handling
- ✅ Share Service (WhatsApp, SMS, generic)
- ✅ QR Code Service with UPI integration
- ✅ File Picker Service with validation
- ✅ 75 new comprehensive tests (251 total)
- ✅ Manual testing on OnePlus 13 - all working
- ✅ TypeScript 0 errors, ESLint clean

### Phase 3: Testing & Hardening ⏳ PLANNED
**Weeks 11-13**: Unit, E2E, manual testing

### Phase 4: Beta Testing ⏳ PLANNED
**Weeks 14-15**: User testing, bug fixes

### Phase 5: Production Launch ⏳ PLANNED
**Weeks 16-18**: Final polish, app stores

## Key Features

### Implemented ✅
- ✅ Equal split with paise-exact rounding
- ✅ Real-time split calculation
- ✅ Encrypted SQLite database (SQLCipher)
- ✅ Soft delete with restore functionality
- ✅ Offline-first architecture
- ✅ Manual payment confirmation
- ✅ Dark theme with glass-morphism design
- ✅ UPI payment link generation (17+ apps)
- ✅ QR code generation with branding
- ✅ Bill history with search and filter
- ✅ Payment status tracking
- ✅ Edit and duplicate bills
- ✅ Multi-screen navigation
- ✅ Contact picker with permissions
- ✅ Share via WhatsApp/SMS
- ✅ Image/PDF attachment support

### In Progress 🔄
- State management with Zustand (Week 8)

### Planned 📋
- Complete UI flows (Week 9)
- Animations and polish (Week 10)
- Pro features (advanced splits, analytics)

## MVP Scope (In Scope)
✅ Equal split only
✅ Manual payment confirmation
✅ Local storage with JSON export
✅ Dark theme only
✅ Contact picker with manual fallback
✅ Image/PDF attachments (no OCR)
✅ UPI links + QR codes
✅ Share via WhatsApp/SMS
✅ Bill history and duplication

## Out of Scope (V1.1+)
❌ Ratio or fixed-amount splits
❌ Automatic SMS payment detection
❌ Cloud sync across devices
❌ OCR bill scanning
❌ Light theme
❌ Link shortener with analytics
❌ In-app notifications

## Technical Stack

### Core
- React Native 0.76.1 with Expo SDK 54
- TypeScript 5.9.2 (strict mode)
- React 19.1.0

### State & Data
- Zustand 5.0.8 (state management)
- SQLite 16.0.8 with SQLCipher (encrypted database)
- expo-secure-store 15.0.7 (encryption keys)

### Animations
- react-native-reanimated 4.1.3
- moti 0.30.0
- @shopify/react-native-skia 2.3.0 (glass effects)

### UI Performance
- @shopify/flash-list 2.1.0 (virtualized lists)
- react-native-gesture-handler 2.28.0

### Native Services (Week 7 ✅)
- expo-contacts 15.0.9 (contact picker)
- expo-sharing 14.0.7 (share dialog)
- expo-document-picker 14.0.7 (file picker)
- react-native-qrcode-svg 6.3.15 (QR generation)
- react-native-svg 15.12.1 (SVG rendering)

### Testing
- jest 30.2.0 + jest-expo 54.0.12
- @testing-library/react-native 13.3.3
- Detox (configured)

## Code Metrics

### Test Coverage
- **Split Engine**: 98.52% (32 tests)
- **Status Manager**: 100% (49 tests)
- **UPI Generator**: 100% (39 tests)
- **QR Code Service**: 100% utilities (34 tests)
- **File Picker Service**: 100% utilities (21 tests)
- **Share Service**: 100% message generation (20 tests)
- **Data Layer**: 100% (repository + encryption)
- **Total Tests**: 251 passing

### Code Organization
- **Components**: 4 reusable UI components
- **Screens**: 5 screens (Create, History, Detail, UPI Validation, Performance POC)
- **Business Logic**: 3 modules (splitEngine, statusManager, upiGenerator)
- **Services**: 4 native service modules (contacts, share, qrCode, filePicker)
- **Data Layer**: 4 modules (encryption, database, billRepository, migrations)
- **Total Lines**: ~13,000+ (production + tests + config)

### Quality
- TypeScript: ✅ 0 errors (strict mode)
- ESLint: ✅ 0 errors (13 acceptable warnings)
- CI/CD: ✅ GitHub Actions (5 jobs)
- Coverage: ✅ 100% on critical paths

## Week 7 Implementation (Native Services)

### Native Services Layer ✅ COMPLETE
**Status**: Completed and verified on physical device

**Services**:
1. **Contact Service** (`contactsService.ts` - ~240 lines)
   - Permission flow with graceful fallback
   - Single/multiple contact selection
   - Contact search functionality
   - User-friendly error messages

2. **Share Service** (`shareService.ts` - ~400 lines)
   - WhatsApp, SMS, generic sharing
   - Message templates (payment, reminder, summary)
   - Platform-specific URL schemes
   - Share cancellation handling

3. **QR Code Service** (`qrCodeService.ts` - ~290 lines)
   - UPI payment QR generation
   - Vasooly branding integration
   - Batch generation for participants
   - File name sanitization

4. **File Picker Service** (`filePickerService.ts` - ~350 lines)
   - Image picker (JPEG, PNG)
   - PDF document picker
   - File validation (size, type, extension)
   - Multi-file selection support

**Success Criteria** ✅:
- ✅ 4 services implemented (~1,280 lines)
- ✅ 75 comprehensive tests (100% utilities coverage)
- ✅ Manual testing complete (OnePlus 13)
- ✅ All services working correctly
- ✅ TypeScript/ESLint passing
- ✅ Integration with existing business logic

## Architecture

### Clean Architecture Layers
```
src/
├── screens/           # UI screens (presentation)
├── components/        # Reusable UI components
├── services/          # Native service integrations (NEW - Week 7)
├── lib/
│   ├── business/     # Business logic (splitEngine, statusManager, upiGenerator)
│   ├── data/         # Database layer (repository, encryption)
│   └── platform/     # Platform utilities
├── stores/           # Zustand state management (Week 8)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Data Flow
1. **UI Layer**: Screens and components (React Native)
2. **State Layer**: Zustand stores (Week 8)
3. **Business Layer**: Pure functions (split calculations, validations)
4. **Service Layer**: Native integrations (contacts, sharing, QR, files) ← **NEW Week 7**
5. **Data Layer**: Repository pattern (database abstraction)
6. **Storage Layer**: Encrypted SQLite (SQLCipher)

## Next Priorities

### Immediate: Week 8 - State Management
**Goal**: Implement Zustand state stores with SQLite persistence

**Tasks**:
1. Create billStore.ts for bill state management
2. Create historyStore.ts for bill history caching
3. Create settingsStore.ts for app preferences
4. Implement SQLite persistence backing
5. Add selectors for optimized re-renders
6. Write store tests (unit + integration)
7. Profile re-render performance

**Timeline**: 3-5 days

### Medium Term: Weeks 9-10
- Complete UI flows (BillReview, Settings screens)
- Animations and polish (60fps validation)

### Long Term: Weeks 11-18
- Testing and hardening
- Beta testing
- Production launch

## Success Metrics

### Development (Current)
- ✅ Test coverage: 100% on critical paths
- ✅ Code quality: Zero critical issues
- ✅ TypeScript: Strict mode, 0 errors
- ✅ CI/CD: 5 jobs passing
- ✅ Native services: All working on device

### User (Post-Launch)
- Time-to-first-link: <60s (95th percentile)
- 24h settlement rate: >50%
- App rating: >4.0 on both stores
- Crash-free rate: >99.5%

## Risk Management

### Mitigated ✅
- Database encryption working
- UPI links validated (1/10 devices)
- 60fps POC built and working
- Testing infrastructure operational
- Native services implemented and tested

### In Progress
- UPI device testing (need 9 more devices)
- Performance testing on physical devices
- State management implementation

### Managed
- Timeline tracking with weekly retrospectives
- Scope control (MVP features only)
- Quality gates at each phase

---

**Last Updated**: 2025-01-20
**Status**: Phase 2 Week 7 Complete ✅
**Next**: Week 8 - State Management (Zustand stores)
