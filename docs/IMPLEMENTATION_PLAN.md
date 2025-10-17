# Vasooly Implementation Plan

**18-Week Production Roadmap**
**Version**: 1.0 | **Updated**: 2025-10-17

---

## Overview

This document provides the complete 18-week implementation roadmap, combining:
- Week-by-week action items
- Phase-based milestones  
- Success criteria and quality gates
- Risk mitigation strategies
- Session summary and key learnings

**Timeline Reality**: 18 weeks to production-ready (not 2 weeks originally estimated)

---

## Phase Summary

| Phase | Duration | Focus | Go/No-Go |
|-------|----------|-------|----------|
| **Phase 0: Foundation** | Weeks 1-2 | Security, encryption, POCs | End of Week 2 |
| **Phase 1: Core Development** | Weeks 3-6 | Features, business logic, basic UI | End of Week 6 |
| **Phase 2: Integration & Polish** | Weeks 7-10 | Native modules, animations, UX | End of Week 10 |
| **Phase 3: Testing & Hardening** | Weeks 11-13 | Unit, E2E, manual testing | End of Week 13 |
| **Phase 4: Beta Testing** | Weeks 14-15 | User testing, bug fixes | End of Week 15 |
| **Phase 5: Production Launch** | Weeks 16-18 | Final polish, app stores | Launch |

---

## Phase 0: Foundation & De-risking (Weeks 1-2)

### Goals
- Set up secure architecture
- Validate critical technical assumptions
- Build performance POCs
- Establish testing infrastructure

### Week 1: Security & Setup ✅

#### Day 1-2: Project Initialization ✅
- [x] Initialize React Native project (Expo SDK 54)
- [x] Set up Git repository and branching strategy
- [x] Configure ESLint, Prettier, TypeScript strict mode
- [x] Install core dependencies (see README.md)
- [x] Create project folder structure (`src/` organization)

#### Day 3-4: Database Encryption (CRITICAL!) ✅
- [x] Install expo-sqlite with SQLCipher support
- [x] Implement secure database initialization with SQLCipher
- [x] Generate and store encryption key with expo-secure-store
- [x] Test encrypted database CRUD operations
- [x] Verify database file cannot be read without key
- [x] Document encryption setup in DATABASE_SETUP.md

#### Day 5: Soft Delete Implementation ✅
- [x] Add `deleted_at` column to all tables (bills, participants, payment_intents, attachments)
- [x] Implement soft delete functions
- [x] Implement restore functionality
- [x] Test soft delete + restore flow
- [x] Update queries to exclude soft-deleted records

### Week 2: De-risking POCs ✅

#### Day 1-2: UPI Validation Framework ✅
- [x] Research UPI deep link schemes for 50+ UPI apps
- [x] Implement UPI validation service
- [x] Create device testing matrix (minimum 10 devices)
- [x] Test standard `upi://pay` links (OnePlus 13 - PASS)
- [x] Test app-specific fallback URIs (All working)
- [x] Document UPI compatibility matrix (UPI_APPS_RESEARCH_2025.md)
- [x] Built interactive UPIValidationScreen for testing
- [x] Fixed 6 bugs during device testing
- ⏳ **Go/No-Go Decision**: 1/10 devices tested (need 9 more for 8/10 target)

#### Day 3-4: Performance POC ✅
- [x] Install Reanimated 3, Skia, Moti
- [x] Build glass card POC with Skia effects (not CSS blur)
- ⏳ Test 60fps animations on 3 mid-range devices (POC ready, testing pending)
- ⏳ Profile with performance tools
- ⏳ Measure render times (<16ms per frame target)
- ⏳ **Go/No-Go Decision**: POC built, awaiting device testing

#### Day 5: Testing Infrastructure ✅
- [x] Set up Jest for unit tests (104 passing tests)
- [x] Configure React Native Testing Library
- [x] Set up Detox for E2E tests (configured, tests pending)
- [x] Create first tests (split engine, UPI, database)
- [x] Set up CI/CD pipeline (GitHub Actions)
- [x] Configure code coverage reporting (100% on critical paths)

### Phase 0 Success Criteria
✅ Database encryption working (SQLCipher + expo-secure-store)
⏳ UPI links tested and validated (1/10 devices, need 9 more)
✅ 60fps glass effects POC built (device testing pending)
✅ Testing infrastructure operational (104 tests, CI/CD active)
✅ Go/No-Go decision: **PROCEED TO PHASE 1** (tech stack validated)

**Phase 0 Status**: ✅ **COMPLETE** (pending full device testing validation)

---

## Phase 1: Core Development (Weeks 3-6)

### Week 3: Split Engine (Business Logic)

**Why First**: Framework-agnostic, fully testable, core value proposition

#### Implementation
- [ ] Create `src/core/splitEngine.ts`
- [ ] Implement `calculateEqualSplit` with paise arithmetic
- [ ] Implement rounding reconciliation algorithm
- [ ] Add split validation functions
- [ ] Write comprehensive unit tests (90%+ coverage)
  - Edge cases: 1 person, 1000 people, odd amounts, rounding edge cases
  - Property-based tests for sum invariant
- [ ] Document API with JSDoc comments

```typescript
// Target API
export function calculateEqualSplit(
  totalPaise: number,
  participantIds: string[],
  roundingPolicy: 'paise' | 'whole-rupee'
): SplitResult[];
```

### Week 4: Database Layer

#### Implementation
- [ ] Create `src/data/database.ts` with SQLite abstraction
- [ ] Implement bills CRUD operations
- [ ] Implement participants CRUD operations
- [ ] Implement payment intents CRUD operations
- [ ] Implement attachments CRUD operations
- [ ] Add database indexes for performance
- [ ] Write integration tests for all CRUD operations
- [ ] Test database migrations
- [ ] Test concurrent access scenarios

### Week 5: UPI Generator + Status Manager

#### UPI Generator
- [ ] Create `src/core/upiGenerator.ts`
- [ ] Implement standard UPI URI generation
- [ ] Implement app-specific fallback URIs
- [ ] Add VPA format validation
- [ ] Generate unique transaction references
- [ ] Write unit tests (90%+ coverage)
- [ ] Manual test on 10+ devices

#### Status Manager
- [ ] Create `src/core/statusManager.ts`
- [ ] Implement payment status updates
- [ ] Implement remainder calculation for partial payments
- [ ] Implement settlement summary computation
- [ ] Write unit tests for all status transitions

### Week 6: Basic UI (Bill Create Screen)

#### Implementation
- [ ] Set up design tokens (`src/design/tokens.ts`)
- [ ] Create base components (GlassCard, Button, Input)
- [ ] Build BillCreate screen structure
- [ ] Integrate split engine with UI
- [ ] Add form validation
- [ ] Implement basic navigation (React Navigation)
- [ ] Write component tests
- [ ] E2E test: Create bill flow

### Phase 1 Success Criteria
✅ Split engine: 90%+ test coverage, all edge cases handled
✅ Database: All CRUD working, migrations tested
✅ UPI Generator: Links validated on 10+ devices
✅ Basic UI: Can create bill and see calculated splits

---

## Phase 2: Integration & Polish (Weeks 7-10)

### Week 7: Native Modules Integration

#### Contacts
- [ ] Install `react-native-contacts`
- [ ] Implement contacts service (`src/services/contactsService.ts`)
- [ ] Add permission handling with graceful fallback
- [ ] Test on iOS + Android
- [ ] Handle edge cases (no contacts, no permission)

#### Share
- [ ] Install `react-native-share`
- [ ] Implement share service (`src/services/shareService.ts`)
- [ ] Create message templates
- [ ] Test WhatsApp, SMS, generic sharing
- [ ] Handle share cancellation

#### QR + File Picker
- [ ] Install `react-native-qrcode-svg` and `react-native-document-picker`
- [ ] Implement QR generation service
- [ ] Implement file picker for attachments
- [ ] Test QR code scanning with UPI apps
- [ ] Handle file picker cancellation

### Week 8: State Management

#### Zustand Stores
- [ ] Create `src/stores/billStore.ts`
- [ ] Create `src/stores/historyStore.ts`
- [ ] Create `src/stores/settingsStore.ts`
- [ ] Implement persistence with SQLite backing
- [ ] Add selectors for optimized re-renders
- [ ] Write store tests
- [ ] Profile re-render performance

### Week 9: Complete UI Flows

#### Screens
- [ ] BillCreate screen (complete)
- [ ] BillReview screen (share UPI links/QRs)
- [ ] BillDetails screen (track status)
- [ ] History screen (list recent bills)
- [ ] Settings screen (default VPA, rounding policy)

#### Navigation
- [ ] Set up React Navigation stack
- [ ] Implement deep linking (future-proofing)
- [ ] Add screen transitions
- [ ] Test navigation flows

### Week 10: Animations & Polish

#### Animations (Reanimated 3)
- [ ] Implement spring-based screen transitions
- [ ] Add micro-interactions (button presses, status changes)
- [ ] Create "All Paid" celebration animation
- [ ] Add haptic feedback
- [ ] Profile animation performance (60fps validation)

#### Glass Effects (Skia)
- [ ] Apply Skia glass effects to all cards
- [ ] Add glow effects for interactive elements
- [ ] Optimize blur performance
- [ ] Test on mid-range devices

### Phase 2 Success Criteria
✅ All native modules working on iOS + Android
✅ Complete user flows implemented
✅ 60fps animations validated on 3 mid-range devices
✅ UI polish matches CRED-like quality standards

---

## Phase 3: Testing & Hardening (Weeks 11-13)

### Week 11: Unit & Integration Testing

#### Coverage Goals
- [ ] Business logic: 90%+ unit test coverage
- [ ] Database layer: 100% integration test coverage
- [ ] State management: 80%+ coverage
- [ ] Services: 90%+ coverage
- [ ] Run coverage reports, identify gaps

#### Edge Cases
- [ ] Split engine: Test 1, 2, 100, 1000 participants
- [ ] UPI Generator: Test invalid VPAs, long notes
- [ ] Status Manager: Test all state transitions
- [ ] Database: Test concurrent writes, transactions
- [ ] Error scenarios: Network failures, permission denials

### Week 12: E2E Testing (Detox)

#### Critical User Flows
- [ ] Create bill → Add participants → Generate links → Share
- [ ] Create bill → Mark paid → Verify summary updates
- [ ] Create bill → Mark partial → Generate remainder link
- [ ] History → Duplicate bill → Verify data carried over
- [ ] Settings → Change default VPA → Verify applied to new bills
- [ ] Export JSON → Verify all data included

#### Device Testing
- [ ] Run E2E tests on iOS simulator
- [ ] Run E2E tests on Android emulator
- [ ] Run E2E tests on 2 physical devices (iOS + Android)

### Week 13: Manual Testing & Bug Fixing

#### Manual Test Matrix
- [ ] UPI compatibility: Test all links on 10+ devices
- [ ] Performance: Validate 60fps on mid-range phones
- [ ] Offline mode: Test all flows without network
- [ ] Contact picker: Test edge cases (no contacts, denied permission)
- [ ] Attachment handling: Test large PDFs, corrupt images
- [ ] Long-running stability: Create 100 bills, test performance

#### Bug Bash
- [ ] Internal team testing (whole team, full day)
- [ ] Log all bugs in issue tracker
- [ ] Prioritize by severity (P0 = blocker, P1 = major, P2 = minor)
- [ ] Fix all P0 and P1 bugs
- [ ] Re-test fixed bugs

### Phase 3 Success Criteria
✅ 90%+ test coverage for business logic
✅ All E2E tests passing
✅ Zero P0 bugs, <5 P1 bugs
✅ Manual testing complete on 10+ devices
✅ Crash-free rate > 99.5%

---

## Phase 4: Beta Testing (Weeks 14-15)

### Week 14: Beta Preparation

#### Beta Build
- [ ] Create beta build with Crashlytics/Sentry
- [ ] Set up TestFlight (iOS) and Google Play Beta (Android)
- [ ] Create beta onboarding flow
- [ ] Add feedback mechanism (in-app or external form)
- [ ] Prepare beta documentation

#### Beta User Recruitment
- [ ] Recruit 10-15 beta users (target: friends, family, colleagues)
- [ ] Mix of iOS and Android users
- [ ] Mix of UPI apps (GPay, PhonePe, Paytm)
- [ ] Send beta invitations

### Week 15: Beta Testing & Feedback

#### Beta Activities
- [ ] Monitor Crashlytics for crashes
- [ ] Monitor user feedback submissions
- [ ] Daily check-ins with beta users
- [ ] Log beta bugs in issue tracker
- [ ] Prioritize bugs (P0 = blocker for launch)

#### Beta Metrics
- [ ] Time-to-first-link (target: <60s)
- [ ] Crash-free rate (target: >99.5%)
- [ ] UPI link success rate (target: >95%)
- [ ] User satisfaction (survey, target: >4/5)

#### Bug Fixes
- [ ] Fix all P0 bugs immediately
- [ ] Fix P1 bugs within 2 days
- [ ] Release beta updates as needed
- [ ] Re-test with beta users

### Phase 4 Success Criteria
✅ 10+ beta users tested successfully
✅ Crash-free rate > 99.5%
✅ Time-to-first-link < 60s (95th percentile)
✅ User satisfaction > 4/5
✅ Zero P0 bugs, <3 P1 bugs

---

## Phase 5: Production Launch (Weeks 16-18)

### Week 16: App Store Preparation

#### Assets
- [ ] App icons (all sizes, iOS + Android)
- [ ] Screenshots (5 per platform, localized)
- [ ] App Store preview video (optional but recommended)
- [ ] Marketing copy (descriptions, keywords)

#### Legal/Compliance
- [ ] Privacy policy (published on website)
- [ ] Terms of service (published on website)
- [ ] App Store privacy labels (iOS)
- [ ] Google Play Data Safety (Android)

#### Metadata
- [ ] App Store Connect setup (iOS)
- [ ] Google Play Console setup (Android)
- [ ] Upload metadata, screenshots, descriptions
- [ ] Set pricing (free with IAP for Pro)
- [ ] Configure IAP products (if launching with Pro)

### Week 17: Final Polish & Submission

#### Final Testing
- [ ] Full regression testing
- [ ] Performance validation on 5 devices
- [ ] Security audit (internal or external)
- [ ] Accessibility testing (VoiceOver, TalkBack)
- [ ] Legal review (privacy policy, terms)

#### Submission
- [ ] Build production release (iOS + Android)
- [ ] Upload to App Store Connect
- [ ] Upload to Google Play Console
- [ ] Submit for review
- [ ] Monitor review status daily

### Week 18: Launch & Monitoring

#### Pre-Launch
- [ ] Prepare launch announcement (social media, website)
- [ ] Set up analytics (optional, privacy-focused)
- [ ] Set up crash reporting (Crashlytics/Sentry)
- [ ] Prepare customer support channels (email, FAQ)

#### Launch Day
- [ ] Apps approved and live
- [ ] Announce launch
- [ ] Monitor crash reports
- [ ] Monitor user reviews
- [ ] Respond to critical issues within 4 hours

#### Post-Launch (Week 18)
- [ ] Daily monitoring (crashes, reviews, metrics)
- [ ] Fix critical bugs (hotfix releases)
- [ ] Gather user feedback for V1.1
- [ ] Celebrate launch! 🎉

### Phase 5 Success Criteria
✅ Apps approved and live on both stores
✅ Crash-free rate > 99.5% in first week
✅ Positive user reviews (>4.0 rating)
✅ No critical bugs requiring hotfix

---

## Quality Gates

Each phase has mandatory quality gates:

### Phase 0 Gate
- [ ] Database encryption working
- [ ] UPI validation complete (8/10 devices)
- [ ] 60fps POC successful
- [ ] Decision: Proceed or pivot tech stack

### Phase 1 Gate
- [ ] 90%+ test coverage for business logic
- [ ] All CRUD operations working
- [ ] Can create bill and generate UPI links
- [ ] Decision: Proceed or refactor architecture

### Phase 2 Gate
- [ ] All screens implemented
- [ ] 60fps animations on mid-range devices
- [ ] Native modules working
- [ ] Decision: Proceed to testing or fix performance

### Phase 3 Gate
- [ ] All E2E tests passing
- [ ] <5 P1 bugs remaining
- [ ] Manual testing complete
- [ ] Decision: Proceed to beta or fix major issues

### Phase 4 Gate
- [ ] Beta users satisfied (>4/5)
- [ ] Zero P0 bugs
- [ ] Crash-free > 99.5%
- [ ] Decision: Proceed to launch or extend beta

### Phase 5 Gate
- [ ] Apps approved by stores
- [ ] No critical issues in first week
- [ ] User feedback positive
- [ ] Decision: Launch success or emergency response

---

## Risk Mitigation

### Technical Risks

**Risk**: UPI links don't work on some devices
**Mitigation**: Test on 10+ devices in Phase 0, implement fallbacks, provide clear error messages

**Risk**: 60fps animations not achievable
**Mitigation**: Build POC in Week 2, use Skia (not CSS), profile early, cut animations if needed

**Risk**: Database encryption breaks performance
**Mitigation**: Benchmark in Week 1, optimize queries, use indexes, test on low-end devices

**Risk**: Timeline slips
**Mitigation**: Weekly retrospectives, cut scope not quality, focus on MVP features only

### Launch Risks

**Risk**: App store rejection
**Mitigation**: Follow guidelines, legal review, test privacy features, provide clear descriptions

**Risk**: Crash spike after launch
**Mitigation**: Comprehensive testing, beta period, crash monitoring, hotfix plan ready

**Risk**: Poor user reviews
**Mitigation**: Beta testing, polish animations, user-friendly errors, fast support response

---

## Session Summary

### Key Learnings

1. **Timeline Reality**: Financial apps need 8-10x more time due to security, testing, compliance
2. **Architecture Review Value**: Expert review found 9 critical issues, prevented 12+ weeks of rework
3. **Performance vs Polish**: CRED-like UX requires Skia (3-4 week investment), not CSS
4. **UPI Complexity**: Deep links not standardized, need 2 weeks validation + fallbacks
5. **Security Non-Negotiable**: Encryption, testing, data protection cannot be shortcuts

### Technical Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React Native | Performance + ecosystem + animations |
| State | Zustand | Lightweight, no Redux boilerplate |
| Database | SQLite + SQLCipher | Encrypted, ACID, mature |
| Animations | Reanimated 3 | 60fps worklets on UI thread |
| Rounding | Paise-exact only | Simplicity, transparency |
| UPI Reference | Fresh per send | Better tracking, no caching |
| Theme | Dark-only MVP | Focus core UX first |

### Scope Decisions

**In MVP**:
- Equal split only
- Manual payment confirmation
- Local storage with manual export
- Dark theme only
- Contact picker OR manual entry
- UPI links + QR codes

**Deferred to V1.1+**:
- Ratio/fixed splits
- Automatic payment detection
- Cloud sync
- OCR bill scanning
- Light theme
- Link analytics

---

## Success Metrics

### Development Metrics
- [ ] Test coverage: >90% for business logic
- [ ] Code quality: Zero critical Sonar issues
- [ ] Performance: 60fps on 99th percentile
- [ ] Crash-free: >99.5% sessions

### User Metrics (Post-Launch)
- [ ] Time-to-first-link: <60s (95th percentile)
- [ ] 24h settlement rate: >50%
- [ ] Reminder effectiveness: >30% conversion
- [ ] App rating: >4.0 on both stores

### Business Metrics
- [ ] Week 1 downloads: >1000
- [ ] Week 4 retention: >40%
- [ ] Pro conversion: >5% (if launched with IAP)

---

## Daily/Weekly Routines

### Daily (During Development)
- Morning: Review overnight crashes/errors
- Standup: Blockers, progress, plan
- Development: Focus time, minimal meetings
- Evening: Code review, update progress

### Weekly
- Monday: Sprint planning, review roadmap
- Wednesday: Mid-week check-in, adjust plan
- Friday: Demo, retrospective, week closure
- Continuous: Update IMPLEMENTATION_PLAN.md progress

### Per Phase
- Start: Review phase goals, set expectations
- Middle: Check quality gates, adjust if needed
- End: Phase retrospective, Go/No-Go decision

---

## Next Actions

### Immediate (Week 0)
1. ✅ Review all documentation (entire team)
2. ✅ Validate tech stack against team skills
3. ✅ Adjust timeline based on capacity
4. ✅ Set up project repository

### Week 1 Kickoff
1. Initialize React Native project
2. Install dependencies
3. Configure SQLCipher encryption
4. Create project structure
5. First commit: "Initial setup with encryption"

---

**Document Status**: Complete
**Last Updated**: 2025-10-17
**Maintained By**: Vasooly Team
**Next Review**: Weekly during development
