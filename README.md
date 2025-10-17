# Vasooly - UPI Bill Splitter

**Status**: Design Phase | **Version**: 1.0 | **Updated**: 2025-10-17

> *Split any bill in seconds. Send UPI pay links via SMS/WhatsApp to friends who don't need the app. Track who's paid, nudge the rest.*

---

## 🎯 What is Vasooly?

Vasooly is a mobile-first UPI bill splitting application for the Indian market that enables:

- ✅ **60-second bill splits** from app launch to shared links
- ✅ **Zero-install payments** via UPI deep links (recipients don't need the app)
- ✅ **Complete offline operation** with local-first architecture
- ✅ **CRED-like premium UX** with 60fps animations and glass effects
- ✅ **Privacy-focused design** with encrypted local storage

**Target**: iOS + Android from single React Native codebase
**Market**: Indian B2C, freemium model with Pro features
**Timeline**: 18 weeks to production-ready (not 2 weeks)

---

## 📚 Documentation

### Core Documents (Read in Order)

| Document | Purpose | Time | When to Read |
|----------|---------|------|--------------|
| **[README.md](README.md)** | Project overview & quick start | 15 min | Start here |
| **[docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)** | Complete architecture + review | 60 min | Before coding |
| **[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)** | 18-week roadmap + tasks | 30 min | Sprint planning |

---

## ⚡ Quick Start (15 Minutes)

### The Product in One Sentence
Split bills and collect money via UPI links sent through WhatsApp/SMS—recipients don't install anything.

### The Tech Stack in One Sentence
React Native app with encrypted SQLite, offline-first architecture, and native integrations for contacts/sharing/QR.

### The Reality Check in One Sentence
**18 weeks** to production (not 2), with critical security and performance work required before launch.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────┐
│   Presentation (React Native UI)   │  Screens, Animations, Design System
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│  State Management (Zustand)        │  Bill, History, Settings Stores
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│  Business Logic (Pure TypeScript)  │  Split Engine, UPI Gen, Status
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│  Data Access (SQLite + SQLCipher)  │  Encrypted local database
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│  Platform Services (Native)        │  Contacts, Share, QR, Files, Haptics
└────────────────────────────────────┘
```

### Technology Stack

**Core Framework**: React Native 0.73+
- **State**: Zustand (lightweight, no Redux boilerplate)
- **Database**: react-native-quick-sqlite + SQLCipher (encrypted)
- **Animations**: Reanimated 3 + Moti (60fps worklets)
- **Lists**: FlashList (virtualized rendering)
- **Native Modules**: Contacts, Share, QR, File Picker, Haptics

**Why React Native?**
✅ Best balance of performance, ecosystem, and animation capabilities
✅ Proven for CRED-like polish with Reanimated 3 + Skia
✅ Single codebase for iOS + Android
✅ Strong native module support

---

## 🚨 Critical Issues (Must Know)

### Tier 1 Blockers (Fix Before Launch)

**Issue #1: Database Encryption** (Risk: 9/10)
**Problem**: Financial data in plaintext SQLite
**Fix**: SQLCipher + OS Keychain integration
**Effort**: 1 week
**Impact**: App store rejection, data breach risk

**Issue #2: UPI Validation** (Risk: 8/10)
**Problem**: No validation that links work across all UPI apps
**Fix**: Validation framework + 10+ device testing
**Effort**: 2 weeks
**Impact**: App may not work for many users

**Issue #3: Performance Guarantees** (Risk: 7/10)
**Problem**: CSS blur can't hit 60fps on mid-range devices
**Fix**: Skia-based glass effects
**Effort**: 1-2 weeks
**Impact**: CRED-like promise fails

**Issue #4: Data Loss Prevention** (Risk: 9/10)
**Problem**: No backups, hard deletes, no undo
**Fix**: Soft deletes + automatic backup system
**Effort**: 1 week
**Impact**: Users permanently lose bill data

**→ See [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) for all 9 issues and fixes**

---

## 📐 Core Concepts

### 1. UPI Payment Links
**What**: Deep links (`upi://pay?pa=...`) that open recipient's existing UPI app
**Why**: Zero-install experience for recipients
**Challenge**: Different UPI apps handle links differently (GPay, PhonePe, Paytm)

### 2. Local-First Architecture
**What**: All bill data stored locally in encrypted SQLite
**Why**: Privacy, offline functionality, no server costs
**Trade-off**: No multi-device sync in MVP (V2 feature)

### 3. Split Engine
**What**: Core algorithm dividing bills with paise-exact rounding
**Math**: Uses integer paise (not floats) to avoid precision errors
**Example**: ₹100 ÷ 3 = [3334, 3333, 3333] paise

### 4. CRED-like UX
**What**: Premium dark UI with glass effects, spring animations, celebrations
**How**: Reanimated 3 worklets (60fps), Skia for glass blur
**Challenge**: Performance-intensive, requires optimization

---

## 🎯 MVP Scope

### ✅ In Scope (Production MVP)
- Equal split only (no ratio/fixed)
- Manual payment confirmation
- Local storage with manual JSON export
- Dark theme only
- Contact picker OR manual entry
- Image/PDF attachments (no OCR)
- UPI links + QR codes
- Share via WhatsApp/SMS
- Bill history and duplication

### ❌ Out of Scope (V1.1+)
- Ratio or fixed-amount splits
- Automatic payment detection via SMS
- Cloud sync across devices
- OCR bill scanning
- Light theme
- Link shortener with analytics
- In-app notifications
- CSV import/export

**Strategy**: Remove features, not quality or security

---

## 📅 Timeline Reality Check

### Original PRD: 2 weeks MVP ❌
**Reality**: Only achievable for non-production demo

### Production-Ready: 18 weeks ✅

| Phase | Duration | What Gets Built |
|-------|----------|-----------------|
| **Phase 0: Foundation** | 2 weeks | Security, encryption, performance POCs |
| **Phase 1: Core Dev** | 4 weeks | Split engine, UPI, database, basic UI |
| **Phase 2: Integration** | 4 weeks | Native modules, animations, polish |
| **Phase 3: Testing** | 3 weeks | Unit, integration, E2E, manual tests |
| **Phase 4: Beta** | 2 weeks | User testing, bug fixes |
| **Phase 5: Launch** | 3 weeks | Final polish, app store submission |

**Why the Gap?**
2-week estimate ignored: encryption (1w), UPI validation (2w), performance (2w), testing (3w), security (1w), beta (2w), stores (1w) = **12 weeks missing**

---

## 🚀 Getting Started

### For Different Roles

**Founders/PMs**:
1. Read this README (15 min)
2. Read [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) timeline section
3. Accept 18-week timeline, not 2 weeks

**Developers**:
1. Read this README (15 min)
2. Read [SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) architecture sections
3. Start with Phase 0 tasks (security setup)

**Technical Leads**:
1. Read all 3 core documents (2 hours total)
2. Review critical issues in SYSTEM_DESIGN.md
3. Validate tech stack against team skills

### Week 1 Setup

```bash
# Initialize React Native project
npx create-expo-app vasooly --template expo-template-blank-typescript

# Install core dependencies
npm install zustand react-native-quick-sqlite
npm install react-native-reanimated react-native-gesture-handler
npm install @shopify/flash-list date-fns zod

# Install native modules
npm install react-native-contacts react-native-share
npm install react-native-document-picker react-native-qrcode-svg
npm install react-native-haptic-feedback

# Install encryption (CRITICAL!)
npm install @op-engineering/op-sqlite react-native-keychain

# Set up testing
npm install --save-dev jest @testing-library/react-native detox
```

---

## 🔑 Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | React Native | Best balance: performance + ecosystem + animations |
| **State** | Zustand | Lightweight, no Redux boilerplate |
| **Database** | SQLite + SQLCipher | Mature, ACID, encrypted |
| **Animations** | Reanimated 3 | UI-thread worklets for 60fps |
| **Architecture** | Local-First | Privacy, offline, no server costs |
| **Rounding** | Paise-exact only | Simplicity, transparency |
| **UPI Reference** | Fresh per send | Better tracking, no caching issues |
| **Theme** | Dark-only MVP | Focus core UX first |

---

## 📊 Success Criteria

### MVP Launch Checklist
- [ ] All 4 Tier 1 issues resolved
- [ ] Database encryption verified (SQLCipher)
- [ ] UPI links tested on 10+ devices (iOS + Android)
- [ ] 60fps animations confirmed on mid-range phones
- [ ] 90%+ test coverage for business logic
- [ ] Security audit completed
- [ ] 10+ beta users tested successfully
- [ ] Crash-free rate > 99.5%
- [ ] Time-to-first-link < 60s (95th percentile)

### Performance Benchmarks
- Startup time: <2s (cold launch)
- Time-to-first-link: <60s consistently
- Animation frame rate: 60fps (99th percentile)
- Database queries: <50ms average
- Bundle size: <50MB

---

## 🆘 Common Issues & Solutions

**"UPI links don't open in some apps"**
→ Implement app-specific fallback URIs (see SYSTEM_DESIGN.md Section 5.2)
→ Test on GPay, PhonePe, Paytm, BHIM minimum

**"Animations are janky"**
→ Use Reanimated worklets on UI thread (not Animated API)
→ Replace CSS blur with Skia glass effects
→ Profile with Flipper Performance Monitor

**"App crashes on older devices"**
→ Use FlashList for all lists (not FlatList)
→ Compress images, memoize expensive components
→ Profile with Xcode Instruments / Android Profiler

**"Data lost after reinstall"**
→ Implement automatic backup (SYSTEM_DESIGN.md Section 7.4)
→ Educate users on manual JSON export

**"Timeline is slipping"**
→ Cut scope, not quality (remove ratio splits, OCR, light theme)
→ Weekly retrospectives with IMPLEMENTATION_PLAN.md checklist

---

## 📖 Further Reading

### Essential Documentation
- **This README**: Project overview and quick start
- **[docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)**: Complete architecture + critical review
- **[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)**: 18-week roadmap + tasks

### External Resources
- **React Native**: https://reactnative.dev/docs/getting-started
- **Reanimated**: https://docs.swmansion.com/react-native-reanimated/
- **UPI Spec**: https://www.npci.org.in/what-we-do/upi/upi-link-specification
- **SQLCipher**: https://www.zetetic.net/sqlcipher/

---

## 🎯 Next Actions

### Immediate (Week 0)
1. ✅ Team reviews all documentation
2. ✅ Validate tech stack against team skills
3. ✅ Adjust timeline based on capacity
4. ✅ Set up project repository

### Week 1 (Foundation)
1. Initialize React Native project
2. Install all dependencies
3. Set up testing infrastructure
4. **Configure SQLCipher encryption** (CRITICAL!)
5. Create project structure

### Week 2 (De-risking POCs)
1. Build UPI validation framework
2. Test UPI links on 10+ devices
3. Create 60fps glass effects POC
4. Validate split engine edge cases
5. **Go/No-Go decision** on tech stack

---

## 📞 Support

**Questions About**:
- **Product/UX**: See docs/SYSTEM_DESIGN.md for product requirements
- **Architecture**: See docs/SYSTEM_DESIGN.md for technical design
- **Timeline**: See docs/IMPLEMENTATION_PLAN.md for schedule
- **Security**: See docs/SYSTEM_DESIGN.md Section 2 (Critical Issues)

---

## 📈 Project Status

**Current Phase**: Design Complete, Ready for Implementation
**Documentation**: 100% complete (3 core documents)
**Architecture**: 6.5/10 (8.5/10 with fixes)
**Timeline**: 18 weeks realistic estimate
**Risk Level**: 🟡 Medium (high if security ignored)

**Overall Status**: 🟢 **Ready to Begin Development**

---

**Last Updated**: 2025-10-17
**Maintained By**: Vasooly Team
**License**: TBD
