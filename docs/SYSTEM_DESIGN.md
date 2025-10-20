# Vasooly System Design

**Complete Architecture + Critical Review**
**Version**: 1.0 | **Status**: Design Phase | **Updated**: 2025-10-17

---

## Document Purpose

This document combines:
1. Complete system architecture specification
2. Critical architecture review findings
3. Security, performance, and testing strategies
4. All technical decisions with rationale

**Read this before writing any code.**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Issues](#critical-issues)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Data Architecture](#data-architecture)
6. [Business Logic](#business-logic)
7. [State Management](#state-management)
8. [Platform Services](#platform-services)
9. [UI Architecture](#ui-architecture)
10. [Security Architecture](#security-architecture)
11. [Performance Strategy](#performance-strategy)
12. [Testing Strategy](#testing-strategy)
13. [Deployment](#deployment)

---

## Executive Summary

### TL;DR
Vasooly is a local-first, mobile-native UPI bill splitter with **solid conceptual foundations** but **9 critical gaps** requiring fixes before launch.

**Architecture Quality**: 6.5/10 (8.5/10 with fixes)
**Launch Readiness**: ❌ NOT PRODUCTION READY
**Timeline**: 18 weeks (not 2 weeks as originally estimated)

### Strengths ✅
- Excellent tech stack choices (React Native + Zustand + SQLite)
- Clean architecture with proper layer separation
- Appropriate offline-first approach for use case
- Testable business logic design

### Critical Flaws ❌
- Unencrypted financial data (Risk: 9/10)
- No UPI validation framework (Risk: 8/10)
- Performance not guaranteed (Risk: 7/10)
- Data loss risks (Risk: 9/10)

**Launch Recommendation**: **DO NOT LAUNCH** until Tier 1 issues resolved (5-6 weeks additional work)

---

## Critical Issues

### Tier 1: Launch Blockers

#### Issue #1: Unencrypted Financial Data
**Risk**: 9/10 | **Effort**: 1 week | **Status**: 🔴 Blocker

**Problem**:
- SQLite database stores financial data in plaintext
- Any app or process with device access can read bills, amounts, VPAs
- Violates financial data handling best practices
- Likely app store rejection risk

**Fix**:
```typescript
// Use SQLCipher for encryption
import { open } from '@op-engineering/op-sqlite';
import * as Keychain from 'react-native-keychain';

async function initSecureDatabase() {
  // Generate or retrieve encryption key from OS Keychain
  let credentials = await Keychain.getGenericPassword({ service: 'vasooly.db.key' });
  
  if (!credentials) {
    const key = generateSecureKey(); // 256-bit random key
    await Keychain.setGenericPassword('db', key, { service: 'vasooly.db.key' });
    credentials = { password: key };
  }

  // Open encrypted database
  const db = open({
    name: 'vasooly.db',
    encryption: {
      key: credentials.password
    }
  });

  return db;
}
```

**Testing**:
- Verify database file is not readable without key
- Test key rotation mechanism
- Validate Keychain integration on iOS + Android

---

#### Issue #2: UPI Validation Framework Missing
**Risk**: 8/10 | **Effort**: 2 weeks | **Status**: 🔴 Blocker

**Problem**:
- No validation that generated UPI links work across apps
- Different UPI apps handle `upi://pay` differently
- Some require `tez://`, `phonepe://`, `paytmmp://` schemes
- App may not work for significant % of users

**Fix**:
```typescript
// UPI Validation Framework
export interface UPIValidationResult {
  isValid: boolean;
  supportedApps: string[];
  fallbackUris: Record<string, string>;
  qrCodeWorks: boolean;
}

export async function validateUPILink(
  upiUri: string,
  testDevice: TestDevice
): Promise<UPIValidationResult> {
  const result: UPIValidationResult = {
    isValid: false,
    supportedApps: [],
    fallbackUris: {},
    qrCodeWorks: false
  };

  // Test standard UPI link
  if (await canOpenURL(upiUri)) {
    result.isValid = true;
  }

  // Test app-specific fallbacks
  const apps = ['googlepay', 'phonepe', 'paytm', 'bhim'];
  for (const app of apps) {
    const fallbackUri = convertToAppSpecific(upiUri, app);
    if (await canOpenURL(fallbackUri)) {
      result.supportedApps.push(app);
      result.fallbackUris[app] = fallbackUri;
    }
  }

  // Test QR code path
  result.qrCodeWorks = await testQRCodeScan(upiUri, testDevice);

  return result;
}

// Device testing matrix (minimum 10 devices)
const TEST_DEVICES = [
  { os: 'iOS', version: '17', model: 'iPhone 12' },
  { os: 'iOS', version: '16', model: 'iPhone SE' },
  { os: 'Android', version: '14', model: 'Samsung S21' },
  { os: 'Android', version: '13', model: 'OnePlus 9' },
  { os: 'Android', version: '12', model: 'Xiaomi Redmi' },
  // ... 5 more devices
];
```

**Testing Matrix**:
| Device | GPay | PhonePe | Paytm | BHIM | QR |
|--------|------|---------|-------|------|-----|
| iPhone 12 (iOS 17) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Android S21 (14) | ✅ | ✅ | ✅ | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... |

---

#### Issue #3: Performance Not Guaranteed
**Risk**: 7/10 | **Effort**: 1-2 weeks | **Status**: 🔴 Blocker

**Problem**:
- PRD promises "CRED-like UX" with 60fps animations
- Original design uses CSS `backdrop-filter: blur()` for glass effects
- CSS blur cannot hit 60fps on mid-range Android devices
- Core brand promise will fail

**Fix**:
```typescript
// Use Skia for hardware-accelerated glass effects
import { Canvas, Blur, RoundedRect, LinearGradient } from '@shopify/react-native-skia';

export const GlassCard: React.FC = ({ children }) => {
  return (
    <Canvas style={styles.canvas}>
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={height}
        r={16}
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        />
        <Blur blur={20} mode="clamp" />
      </RoundedRect>
      {children}
    </Canvas>
  );
};
```

**Performance Benchmarks** (must validate in Phase 0):
```typescript
// Performance POC requirements
const PERFORMANCE_TARGETS = {
  fps: {
    minimum: 58, // Allow 2fps drop margin
    target: 60,
    measurement: '99th percentile over 10-second animation'
  },
  glassEffects: {
    renderTime: '<16ms per frame',
    devices: ['iPhone SE 2020', 'Samsung A52', 'OnePlus Nord']
  },
  interactions: {
    touchResponse: '<100ms',
    scrollSmooth: 'No dropped frames during fast scroll'
  }
};
```

**Testing**:
- Build POC with Skia glass effects
- Measure FPS on 3 mid-range devices
- Profile with Flipper Performance Monitor
- Go/No-Go decision at end of Week 2

---

#### Issue #4: Data Loss Prevention Missing
**Risk**: 9/10 | **Effort**: 1 week | **Status**: 🔴 Blocker

**Problem**:
- No backup system (users can lose all data)
- Hard deletes (no undo mechanism)
- No data recovery if app reinstalled
- Critical for financial data application

**Fix**:
```typescript
// Soft delete implementation
interface SoftDeletable {
  deletedAt: string | null;
}

// Update all tables
ALTER TABLE bills ADD COLUMN deleted_at TEXT;
ALTER TABLE participants ADD COLUMN deleted_at TEXT;
ALTER TABLE payment_intents ADD COLUMN deleted_at TEXT;

// Soft delete functions
export async function softDeleteBill(db: Database, billId: string) {
  await db.execute(
    'UPDATE bills SET deleted_at = ? WHERE id = ?',
    [new Date().toISOString(), billId]
  );
}

export async function restoreBill(db: Database, billId: string) {
  await db.execute(
    'UPDATE bills SET deleted_at = NULL WHERE id = ?',
    [billId]
  );
}

// Automatic backup system
export async function enableAutomaticBackups(db: Database) {
  // Export JSON every 24 hours
  setInterval(async () => {
    const data = await exportAllData(db);
    await saveBackup(data, 'auto');
  }, 24 * 60 * 60 * 1000);

  // Keep last 7 auto-backups
  await cleanOldBackups(7);
}
```

**Testing**:
- Verify soft-deleted data not shown in UI
- Test restore functionality
- Validate automatic backup creation
- Test import from backup file

---

### Tier 2: High Priority (Fix Before V1.1)

#### Issue #5: Sync Technical Debt
**Risk**: 6/10 | **Effort**: 3-4 weeks (V2)

**Problem**: Local-first architecture makes future cloud sync harder
**Impact**: V2 feature will require significant refactoring
**Mitigation**: Design data models with sync in mind (add sync metadata columns)

#### Issue #6: React Re-render Storms
**Risk**: 5/10 | **Effort**: 1 week

**Problem**: Zustand stores not optimized, potential cascading re-renders
**Fix**: Use selectors, memoization, split stores by concern

#### Issue #7: Error Handling Gaps
**Risk**: 6/10 | **Effort**: 1 week

**Problem**: No comprehensive error handling strategy
**Fix**: Error boundaries, user-friendly messages, retry mechanisms

#### Issue #8: Permission Edge Cases
**Risk**: 5/10 | **Effort**: 3 days

**Problem**: Contact picker fails if permission denied, no fallback
**Fix**: Graceful degradation to manual entry

#### Issue #9: Testing Coverage Insufficient
**Risk**: 7/10 | **Effort**: 2 weeks

**Problem**: Original plan had < 70% coverage
**Fix**: 90%+ for business logic, comprehensive E2E tests

---

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Screens    │  │  Animations  │  │  Design System │  │
│  │             │  │  (Reanimated)│  │  (Atoms/Tokens)│  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Bill Store  │  │ History Store│  │ Settings Store│  │
│  │  (Zustand)   │  │  (Zustand)   │  │  (Zustand)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │Split Engine│  │UPI Generator│  │ Status Manager   │  │
│  │ (Pure Fns) │  │ (Pure Fns) │  │  (Pure Fns)      │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Database Service (SQLite Abstraction)     │   │
│  │  • Bills  • Participants  • PaymentIntents       │   │
│  │  • Attachments  • SplitConfig                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                 PLATFORM SERVICES LAYER                   │
│  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Contacts  │ │   Share   │ │File Picker│ │ Haptics│  │
│  │ (Native)  │ │ (Native)  │ │ (Native) │ │(Native) │  │
│  └───────────┘ └───────────┘ └──────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Clean Architecture**: Clear separation between UI, business logic, and data
2. **Framework Agnostic Core**: Business logic independent of React Native
3. **Testability First**: Pure functions, DI, comprehensive tests
4. **Performance by Design**: Optimized rendering, lazy loading
5. **Privacy Focused**: Local-first, minimal permissions, transparent data handling