# Vasooly System Design

**Architecture Reference**
**Version**: 2.0 | **Status**: Week 10 - Implementation Phase | **Updated**: 2025-10-20

---

## Document Purpose

This document defines:
1. System architecture specification
2. Technology stack and design decisions
3. Architecture principles and patterns

**Reference for understanding system design and architecture decisions.**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Architecture Principles](#architecture-principles)

---

## Executive Summary

Vasooly is a **local-first, mobile-native UPI bill splitter** built with React Native, Expo, and SQLite.

**Current Status**: Week 10 - Core features implemented, Phase 2 UI/UX complete
**Architecture Quality**: Production-ready with clean separation of concerns
**Testing Coverage**: 314 passing tests

### Strengths ✅
- Excellent tech stack: React Native + Zustand + SQLite + SQLCipher
- Clean architecture with proper layer separation
- Offline-first approach with encrypted local storage
- Testable business logic with 100% core coverage
- Complete UPI integration with validation framework
- Earthen design system for consistent UI/UX

### Technical Highlights
- **Security**: SQLCipher encryption for financial data
- **Performance**: Earthen design with optimized animations
- **Data Safety**: Soft delete implementation
- **UPI Support**: 17+ UPI apps with fallback URIs
- **Testing**: Comprehensive test suite with E2E coverage

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