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
**Timeline**: 18 weeks to production-ready (Phase 0 complete, 16 weeks remaining)

## Current Status
**Phase**: Phase 0 Complete ✅ (Foundation & De-risking Done!)
**Week**: 2/18 complete (7.1% progress)
**Tests**: 104 passing tests with 100% coverage on critical paths
**Documentation**: 13 core documents complete
**Device Testing**: 1/10 devices validated (OnePlus 13 - PASS)

## Key Features
- Equal split with paise-exact rounding
- UPI payment link generation (50+ apps supported)
- QR code generation with branding
- Encrypted SQLite database (SQLCipher)
- Soft delete with restore functionality
- Offline-first architecture
- Manual payment confirmation
- Dark theme only (MVP)

## MVP Scope (In Scope)
✅ Equal split only
✅ Manual payment confirmation
✅ Local storage with JSON export
✅ Dark theme only
✅ Contact picker OR manual entry
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
