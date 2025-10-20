# Vasooly Design System & UI/UX Specification

**Version**: 2.0 - World-Class Redesign
**Date**: January 20, 2025
**Status**: Strategic Design Document

---

## Executive Summary

### Current State Analysis

**What We Have:**
- ✅ Core functionality (bill splitting, UPI links, payment tracking)
- ✅ Basic animations and haptic feedback
- ✅ Dark theme with glass-morphism effects
- ✅ 4 screens: BillCreate, BillHistory, BillDetail, Settings

**Critical Gaps:**
- ❌ No onboarding (users dumped into app with no context)
- ❌ No dashboard/home screen (unclear entry point)
- ❌ Generic default theme (no distinctive brand personality)
- ❌ Incomplete user journey (missing friends, groups, insights)
- ❌ No brand identity (feels like demo, not product)
- ❌ Limited visual language (stock icons, no illustrations)

**Market Reality:**
- 73% of users would switch financial apps for better UX
- 88% won't return after a bad experience
- 30% of users want integrated bill splitting (huge opportunity)
- 70% reduction in onboarding abandonment with biometric auth

**Verdict**: Current UI is functional but not launchable for competitive market

---

### Vision for Vasooly

**Positioning**: "Modern financial companion for shared experiences"

NOT: Another bill-splitting utility
BUT: A stress-free way to share costs with friends, transparently and fairly

**Core Promise**:
- **Fair**: Everyone sees the same numbers, no confusion
- **Fast**: Split in seconds, get paid instantly
- **Friendly**: Money conversations without awkwardness

**Differentiation Strategy**:
- Visual debt network (unique to Vasooly)
- Spending insights for financial wellness
- Premium design rivaling Stripe/AirBnB/Revolut
- Transparent by default (no hidden complexity)

---

## I. Brand Identity

### Brand Personality

**Vasooly is:**
- 🤝 **Friendly** - Approachable, not corporate
- 🔍 **Transparent** - Clear about money, no hidden fees
- ⚡ **Efficient** - Quick actions, no bureaucracy
- 😌 **Stress-Free** - Handles complexity so you don't have to
- 🎯 **Fair** - Equal treatment, everyone sees the same data

**Vasooly is NOT:**
- ❌ Corporate banking (too formal, impersonal)
- ❌ Childish fintech (too playful, untrustworthy)
- ❌ Complex accounting (too technical, intimidating)

### Color System

**Strategy**: Warm & Grounded - Trust meets Nature

#### Primary Colors

**Terracotta** - Warmth & Reliability
```
Primary Terracotta: #C2662D
- Usage: Primary actions, highlights, headers
- Psychology: Warm, trustworthy, grounded, earthy
- Examples: "Pay Now" buttons, primary CTAs, important actions
```

**Olive Green** - Growth & Balance
```
Accent Olive: #6B7C4A
- Usage: Success states, positive balances, accents
- Psychology: Growth, stability, natural, prosperous
- Examples: Add button, positive amounts, achievements
```

#### Supporting Colors

**Success Green**
```
Emerald: #10B981
- Usage: Positive balances, completed payments, success states
- Examples: "You're owed ₹2,450", "Payment received!"
```

**Warning Amber**
```
Amber: #F59E0B
- Usage: Pending actions, amounts owed, cautions
- Examples: "You owe ₹890", "Payment pending"
```

**Error Rose**
```
Rose: #EF4444
- Usage: Errors, destructive actions, critical alerts
- Examples: "Payment failed", delete confirmations
```

**Neutral Slate**
```
Slate Range: #64748B to #CBD5E1
- Usage: Secondary text, borders, inactive states
- Examples: Labels, dividers, placeholder text
```

#### Dark Mode Palette

**Background Layers**
```
Base: #0A0A0F (keep current - it's excellent)
Elevated Surface: #1A1A1F
Card Surface: #2A2A2F
Input Background: #1E1E24
```

**Text Hierarchy**
```
Primary Text: #FFFFFF (87% opacity)
Secondary Text: #FFFFFF (60% opacity)
Tertiary Text: #FFFFFF (38% opacity)
Disabled Text: #FFFFFF (24% opacity)
```

**Adjusted Brand Colors for Dark Mode**
```
Terracotta (lightened): #D8814A
Olive (muted): #8B9A6A
Green (desaturated): #34D399
Amber (softer): #FBBF24
Rose (toned): #F87171
```

#### Semantic Color Tokens

```typescript
// Design tokens for consistent usage
colors: {
  // Brand
  brand: {
    primary: '#C2662D',      // Terracotta
    secondary: '#6B7C4A',    // Olive Green
  },

  // Feedback
  success: '#6B7C4A',        // Olive Green (natural growth)
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Rose
  info: '#8B9A6A',           // Muted Olive

  // Financial Semantics
  positive: '#6B7C4A',       // Money you receive (olive green)
  negative: '#F59E0B',       // Money you owe (amber)
  settled: '#6B7C4A',        // Fully paid (olive green)
  pending: '#F59E0B',        // Waiting for payment (amber)

  // Backgrounds (Dark Mode)
  background: {
    base: '#0A0A0F',
    elevated: '#1A1A1F',
    card: '#2A2A2F',
    input: '#1E1E24',
  },

  // Text (Dark Mode)
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.60)',
    tertiary: 'rgba(255, 255, 255, 0.38)',
    disabled: 'rgba(255, 255, 255, 0.24)',
  },

  // Borders
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    focus: '#D8814A',        // Lightened Terracotta
    error: '#F87171',
  }
}
```

### Typography System

**Primary Font Family**: **Inter**

**Why Inter?**
- Designed specifically for user interfaces
- Excellent number/currency rendering (tabular figures)
- Clear distinction between similar characters (0/O, 1/l/I)
- Extensive weight range (100-900)
- Open source, no licensing issues
- Optimized for screens at small sizes

**Fallback Strategy**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro', 'Roboto', sans-serif;
```

#### Type Scale

```typescript
typography: {
  display: {
    fontSize: 48,
    fontWeight: '700', // Bold
    lineHeight: 56,
    letterSpacing: -1,  // -1% for optical adjustment
    // Usage: Dashboard balance, major numbers
  },

  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    // Usage: Screen titles, page headers
  },

  h2: {
    fontSize: 24,
    fontWeight: '600', // Semibold
    lineHeight: 32,
    // Usage: Section headers, card titles
  },

  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    // Usage: Subsection headers, expense titles
  },

  bodyLarge: {
    fontSize: 16,
    fontWeight: '400', // Regular
    lineHeight: 24,    // 150% line height
    // Usage: Primary content, descriptions
  },

  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,    // 150%
    // Usage: Secondary content, list items
  },

  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,    // 133%
    // Usage: Labels, timestamps, hints
  },

  // Special: Currency/Numbers
  currency: {
    fontSize: 18,
    fontWeight: '500', // Medium
    fontVariant: ['tabular-nums'], // Aligned numbers
    // Usage: Transaction amounts
  },
}
```

#### Typography Guidelines

**Hierarchy Principles**:
1. Size creates hierarchy (48 → 12)
2. Weight adds emphasis (700 → 400)
3. Color shows importance (87% → 38% opacity)
4. Never rely on color alone (accessibility)

**Readability Standards**:
- Minimum body text: 14px
- Maximum line length: 65-75 characters
- Minimum contrast: 4.5:1 (WCAG AA)
- Line height: 1.5x font size for body text

**Currency Display Rules**:
- Always use tabular-nums for alignment
- Bold for large amounts (₹10,000+)
- Positive amounts: Success green
- Negative amounts: Warning amber
- Neutral amounts: Primary text color

---

### Icon System

**Strategy**: Custom icons for brand + Lucide for common actions

#### Specifications

```
Base Size: 24x24px (scales to 16, 20, 32, 48)
Stroke Weight: 2px
Corner Radius: 2px (friendly, not harsh)
Style: Outline with filled variants for active states
Grid: Align to 1px grid for crisp rendering
```

#### Icon Categories

**Financial Icons (Custom Designed)**
```
💰 Wallet - Balance, money, funds
💸 Send Money - Payment sent, transfer out
💵 Receive Money - Payment received, incoming
🧾 Receipt - Expense, bill, invoice
✂️ Split - Bill splitting action
✓ Paid - Settled, confirmed, completed
⏳ Pending - Waiting, in progress
📊 Insights - Analytics, spending trends
🎯 Goal - Savings target, objective
```

**Navigation Icons (Lucide)**
```
Home - house
Friends - users
Activity - clock
Settings - settings
Plus - plus-circle (but make special)
Search - search
Filter - filter
```

**Action Icons (Lucide)**
```
Edit - edit-2
Delete - trash-2
Share - share-2
Camera - camera
Copy - copy
Download - download
Upload - upload
```

**Category Icons (Emoji + Custom Hybrid)**
```
🍽️ Food & Dining
🚗 Transport & Travel
🏠 Housing & Utilities
🎬 Entertainment
🛒 Shopping & Retail
📱 Bills & Subscriptions
💼 Work & Business
🎓 Education
💊 Health & Wellness
🎁 Gifts & Donations
❓ Other / Miscellaneous
```

#### Special: Add Button (+)

The "Add Expense" button is the hero of the app - make it special:

```
Design:
- 56x56px circle (larger than other icons)
- Terracotta gradient background (#D8814A → #C2662D)
- White plus icon (3px stroke, centered)
- Subtle shadow (0 4px 12px rgba(194, 102, 45, 0.3))
- Elevated above tab bar

Animation:
- Idle: Subtle pulse (scale 1.0 → 1.05, 2s duration, infinite)
- Pressed: Scale to 0.95 with haptic
- Success: Brief rotation + scale celebration

States:
- Default: Terracotta gradient
- Pressed: Darker terracotta (#A0522D)
- Disabled: Gray with 50% opacity
```

#### Icon Usage Guidelines

**DO:**
- Use consistent stroke weight (2px)
- Align to pixel grid
- Provide adequate touch targets (44x44px minimum)
- Use color to convey meaning (green = positive, red = negative)
- Provide labels for accessibility

**DON'T:**
- Mix filled and outline styles inconsistently
- Use decorative icons without purpose
- Rely on icons alone (always add labels for clarity)
- Use too many colors (limit to 2-3 per icon)

---

### Voice & Tone

**Brand Voice**: Friendly, transparent, stress-free

#### Tone Spectrum

**Serious ←→ Playful**: Lean friendly (60% serious, 40% playful)
**Formal ←→ Casual**: Conversational (70% casual, 30% formal)
**Dry ←→ Humorous**: Warm with light humor (80% warm, 20% humor)
**Authoritative ←→ Humble**: Helpful expert (65% helpful, 35% humble)

#### Content Principles

1. **Lead with clarity** - Make complex finances simple
2. **Be human** - Write like a helpful friend, not a corporation
3. **Acknowledge emotions** - Money is stressful, we get it
4. **Empower users** - Give control and transparency
5. **Celebrate wins** - Make settling up feel good

#### Microcopy Guidelines

**Buttons**
```
❌ Generic           ✅ Vasooly Voice
"Submit"            → "Split It"
"Create"            → "Add Expense"
"Cancel"            → "Not Now"
"Delete"            → "Remove"
"Confirm"           → "Yes, I'm Sure"
```

**Headers**
```
❌ Technical         ✅ Friendly
"Transaction Log"   → "Your Activity"
"Payment Status"    → "Who's Paid?"
"User Profile"      → "Your Profile"
"Participant List"  → "Split With"
```

**Empty States**
```
❌ Blank/Generic          ✅ Helpful & Clear
"No data"                → "No expenses yet! Tap + to add your first one."
"No results found"       → "No matches. Try different keywords?"
"Error loading content"  → "Couldn't load this. Check your connection?"
```

**Errors**
```
❌ Technical              ✅ Human & Actionable
"Error 404"              → "Oops! Couldn't find that expense."
"Network error"          → "Can't connect right now. Check your internet?"
"Invalid input"          → "Hmm, that doesn't look right. Try again?"
"Operation failed"       → "Something went wrong. Want to try again?"
```

**Success**
```
❌ Boring                 ✅ Encouraging
"Success"                → "Done! Everyone's been notified."
"Transaction completed"  → "Marked as paid! Nice one 👍"
"Record created"         → "Expense added! Time to get paid 💸"
```

**Permissions**
```
❌ Demanding              ✅ Explaining Value
"Grant camera access"    → "We'll need your camera to scan receipts. You can change this in Settings."
"Allow contacts"         → "Let's access your contacts to find friends easily."
"Enable notifications"   → "We'll remind you when someone settles up. You're in control!"
```

#### Writing Style Guide

**DO:**
- Use contractions (we'll, you're, can't)
- Address users as "you"
- Use active voice ("We split the bill" not "The bill was split")
- Be specific ("You're owed ₹2,450" not "Outstanding balance")
- Add helpful hints ("Tip: Swipe left to settle up quickly")

**DON'T:**
- Use jargon ("debtor", "creditor", "payee")
- Be overly formal ("Upon completion of the transaction...")
- Use passive voice
- Be vague ("Some action required")
- Overuse emojis (1 per message maximum)

---

## II. Screen Architecture

### Complete Sitemap

```
App Structure (12 Screens Total)

├── 🎬 ONBOARDING FLOW (First-time users)
│   ├── Welcome Splash
│   ├── Value Prop 1 (We handle the math)
│   ├── Value Prop 2 (Get paid instantly)
│   ├── Value Prop 3 (Everyone sees everything)
│   └── Quick Signup
│
├── 🏠 MAIN APP (Bottom Tab Navigation)
│   │
│   ├── [Tab 1] Home/Dashboard
│   │   ├── Balance Overview (Hero)
│   │   ├── Quick Actions (Add, Settle, Request)
│   │   ├── Recent Activity (Last 5)
│   │   └── Active Groups Preview
│   │
│   ├── [Tab 2] Friends
│   │   ├── Friends List (with balances)
│   │   ├── Friend Detail (tap on friend)
│   │   └── Add Friend (invite flow)
│   │
│   ├── [Tab 3] Add Expense (+) - CENTER ELEVATED
│   │   └── Add Expense Modal (slide from bottom)
│   │
│   ├── [Tab 4] Activity
│   │   ├── Transaction History (all expenses)
│   │   ├── Filter/Search
│   │   └── Expense Detail (tap on transaction)
│   │
│   └── [Tab 5] Profile
│       ├── Profile Overview
│       ├── Settings
│       ├── Spending Insights (NEW)
│       └── Help & Support
│
├── 📊 DETAIL SCREENS (Modal/Push)
│   ├── Expense Detail (full breakdown)
│   ├── Friend Detail (history with person)
│   ├── Settle Up (payment options)
│   └── Spending Insights Dashboard (NEW)
│
└── ⚙️ SETTINGS STACK
    ├── Account Settings
    ├── Payment Preferences
    ├── Notifications
    ├── Privacy & Security
    └── About/Help
```

### Navigation Structure

**Bottom Tab Bar** (Primary Navigation)
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [Home]  [Friends]   [+]   [Activity] [Profile] │
│   􀎟       􀉲        􀁌       􀐫        􀉩       │
└──────────────────────────────────────────────────┘

Tab 1: Home - Dashboard with balance
Tab 2: Friends - People you split with
Tab 3: Add (+) - ELEVATED, CENTER (primary action)
Tab 4: Activity - Transaction history
Tab 5: Profile - Settings and insights
```

**Tab States**:
- **Inactive**: Icon outline, 60% opacity, gray
- **Active**: Icon filled, 100% opacity, brand terracotta
- **Center (+)**: Always special (elevated, terracotta gradient, glowing)

**Navigation Patterns**:
- Tab tap: Switch tabs (crossfade animation)
- Screen push: Slide from right (iOS standard)
- Modal present: Slide from bottom (Add Expense, Settle Up)
- Dismiss: Swipe down or tap outside

---

### User Flows

#### Flow 1: First-Time User Onboarding

```
Step 1: App Launch
↓
Step 2: Welcome Splash
- Headline: "Split bills, not friendships"
- Illustration: Friends around table
- CTA: "Get Started"
↓
Step 3-5: Value Proposition (3 screens, swipeable)
- Screen 1: "We handle the math" (calculator)
- Screen 2: "Get paid instantly" (UPI link)
- Screen 3: "Everyone sees everything" (transparency)
- Progress indicator: 1 of 3, 2 of 3, 3 of 3
↓
Step 6: Quick Signup
- Name input
- Phone number (for notifications)
- Optional: Face ID setup (skip allowed)
- Trust message: "Your data is encrypted and private"
↓
Step 7: Navigate to Dashboard
- Auto-open empty state
- Helpful prompt: "Add your first expense to get started!"
- Smooth transition to main app

Total Time: 30-60 seconds
```

#### Flow 2: Add Expense (Core Action)

```
Step 1: Tap Center [+] Button
- Haptic feedback (light)
- Modal slides up from bottom
↓
Step 2: Add Expense Modal Opens
- Large amount input (auto-focused keyboard)
- Quick amount buttons (₹100, ₹500, ₹1K, ₹2K)
- Title input: "What's this for?" (placeholder)
↓
Step 3: Select Category (Optional)
- Icon grid (Food, Transport, Housing, etc.)
- Tap to select, subtle highlight
↓
Step 4: Add Participants
- "Split with" section
- Friend suggestions (frequent contacts)
- Tap to add, avatars appear
- Minimum 2 people (validation)
↓
Step 5: Choose Split Method
- Default: "Split Equally" (auto-selected)
- Alternative: "Custom Split" (tap to expand)
- Live calculation preview
↓
Step 6: Review & Add
- Summary card showing split breakdown
- Each person's share (visual list)
- CTA: "Add Expense" (terracotta, prominent)
- Success: Celebration animation + haptic
↓
Step 7: Return to Previous Screen
- Modal dismisses (slide down)
- Dashboard updates with new expense
- Toast: "Expense added! Time to get paid 💸"

Total Time: 10-20 seconds for simple split
```

#### Flow 3: Settle Up

```
Step 1: Navigate to Friend or Dashboard
- Option A: Tap friend card with outstanding balance
- Option B: Tap "Settle Up" quick action on dashboard
↓
Step 2: Settle Up Modal Opens
- Shows: Amount to settle
- Shows: Friend's name and avatar
- Payment options displayed
↓
Step 3: Choose Payment Method
- UPI Apps (GPay, PhonePe, Paytm, etc.)
- Bank Transfer
- Cash
- Other
↓
Step 4A: If UPI Selected
- Generate UPI link
- Open UPI app deep link
- User completes payment in UPI app
- Returns to Vasooly
↓
Step 4B: If Manual Selected
- "Mark as Paid" button
- Confirmation: "Confirm you paid [Name] ₹[amount]?"
- Optional: Add payment note
↓
Step 5: Record Settlement
- Update balance
- Notify friend
- Celebration animation if fully settled
- Return to previous screen

Total Time: 5-10 seconds for UPI, 3-5 seconds for manual
```

---

## III. Design System Components

### Foundation Layer

#### Spacing System (8px Grid)

```typescript
spacing: {
  xs: 4,    // Tight spacing, icon padding
  sm: 8,    // Small gaps, button padding
  md: 12,   // Medium spacing, card padding
  lg: 16,   // Large spacing, section gaps
  xl: 20,   // Extra large, screen padding
  2xl: 24,  // Major sections
  3xl: 32,  // Screen-level spacing
  4xl: 48,  // Hero sections
}
```

**Usage**:
- Always use multiples of 4px
- Screen padding: 20px (xl)
- Card padding: 16px (lg)
- Element gaps: 12px (md)
- Icon padding: 4px (xs)

#### Border Radius System

```typescript
radius: {
  sm: 8,    // Inputs, small cards
  md: 12,   // Buttons, medium cards
  lg: 16,   // Large cards, modals
  xl: 24,   // Hero cards, special elements
  full: 9999, // Pills, avatars, badges
}
```

#### Shadow/Elevation System

```typescript
shadows: {
  none: 'none',

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // Special: Glow for brand elements
  glow: {
    shadowColor: '#C2662D', // Terracotta
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
}
```

---

### Component Library

#### 1. Buttons

**Primary Button**
```tsx
Appearance:
- Background: Terracotta gradient (#D8814A → #C2662D)
- Text: White, 14px, Semibold
- Padding: 12px 24px
- Border Radius: 12px
- Shadow: md
- Height: 48px minimum

States:
- Default: Full opacity
- Pressed: Scale 0.95, darker terracotta (#A0522D)
- Disabled: 40% opacity, no interaction
- Loading: Spinner + "Processing..."

Usage: Main actions (Add Expense, Settle Up, Save)
```

**Secondary Button**
```tsx
Appearance:
- Background: Transparent
- Border: 1px, rgba(255, 255, 255, 0.2)
- Text: White, 14px, Semibold
- Padding: 12px 24px
- Border Radius: 12px
- No shadow

States:
- Default: Border visible
- Pressed: Background rgba(255, 255, 255, 0.1)
- Disabled: 40% opacity

Usage: Alternative actions (Cancel, Skip, Not Now)
```

**Text Button**
```tsx
Appearance:
- Background: None
- Text: Terracotta (#D8814A in dark mode), 14px, Medium
- Padding: 8px 12px
- No border, no shadow

States:
- Default: Terracotta text
- Pressed: Darker terracotta (#C2662D), 80% opacity
- Disabled: 40% opacity

Usage: Tertiary actions (Learn More, View All, Edit)
```

**Icon Button**
```tsx
Appearance:
- Size: 44x44px (touch target)
- Icon: 24x24px, centered
- Background: rgba(255, 255, 255, 0.1) or transparent
- Border Radius: 12px

States:
- Default: Light background
- Pressed: Scale 0.95, darker background
- Active: Filled icon, brand color

Usage: Settings, Close, Share, etc.
```

#### 2. Inputs

**Text Input**
```tsx
Appearance:
- Background: #1E1E24 (slightly lighter than base)
- Border: 1px, rgba(255, 255, 255, 0.1)
- Text: White, 16px, Regular
- Placeholder: rgba(255, 255, 255, 0.4), 16px
- Padding: 16px
- Border Radius: 12px
- Height: 52px

States:
- Default: Normal border
- Focused: Terracotta border (#D8814A), glow shadow
- Error: Red border (#F87171), error message below
- Disabled: 40% opacity, no interaction

Features:
- Clear button (x icon) when filled
- Character count (optional)
- Helper text below (hint or error)
```

**Amount Input** (Special)
```tsx
Appearance:
- Same as text input but:
- Prefix: ₹ symbol (gray, non-editable)
- Text: 24px, Bold (larger for prominence)
- Keyboard: Numeric only
- Quick amount buttons below (₹100, ₹500, ₹1K, ₹2K)

Features:
- Auto-format with commas (₹1,00,000)
- Limit: ₹1 crore maximum
- Validation: > 0 required
```

**Search Input**
```tsx
Appearance:
- Same as text input but:
- Left icon: Search icon (20px)
- Clear button on right when filled
- Border Radius: full (pill shape)

Features:
- Live search (debounced 300ms)
- Recent searches (optional dropdown)
- No results message if empty
```

#### 3. Cards

**Balance Card** (Dashboard Hero)
```tsx
Appearance:
- Background: Terracotta to Olive gradient (#C2662D → #6B7C4A)
- Padding: 24px
- Border Radius: 24px
- Shadow: lg + glow (terracotta)
- Height: Auto (content-based)

Content:
- Title: "Your Balance" (caption, 60% opacity)
- Amount Owed: ₹X,XXX (display size, green)
- Amount You Owe: ₹X,XXX (display size, amber)
- Net Balance: ₹X,XXX (h1 size, white, bold)
- Animation: Number counting on load

Interaction:
- Tap: Navigate to detailed balance breakdown
- Pull to refresh: Update balance
```

**Transaction Card**
```tsx
Appearance:
- Background: #2A2A2F (elevated surface)
- Padding: 16px
- Border Radius: 16px
- Shadow: sm
- Border: 1px, rgba(255, 255, 255, 0.05)

Layout:
┌────────────────────────────────────┐
│ [Avatar] Name           ₹amount    │
│          Title          Status     │
│          2 hours ago               │
└────────────────────────────────────┘

Elements:
- Avatar: 40px circle (left)
- Name: 14px, Semibold, white
- Title: 14px, Regular, 60% opacity
- Amount: 16px, Medium, color-coded
- Status: Badge (Pending/Settled)
- Timestamp: 12px, Caption, 38% opacity

States:
- Default: Normal appearance
- Pressed: Scale 0.98, darker background
- Swipe Left: Reveal "Settle" action
- Swipe Right: Reveal "Remind" action
```

**Friend Card**
```tsx
Similar to Transaction Card but:

Layout:
┌────────────────────────────────────┐
│ [Avatar] Friend Name   ₹balance    │
│          X expenses    →           │
└────────────────────────────────────┘

Balance Colors:
- Green: They owe you
- Amber: You owe them
- Gray: Settled (₹0)

Tap: Navigate to Friend Detail
```

#### 4. Avatars

**User Avatar**
```tsx
Sizes:
- Small: 24px (lists, mentions)
- Medium: 40px (cards, friends)
- Large: 64px (profile, detail screens)
- XLarge: 96px (profile edit)

Appearance:
- Shape: Circle (border radius: full)
- Border: 2px, rgba(255, 255, 255, 0.2)
- Fallback: Initials (first letter of name)
- Background: Random color from palette

States:
- With image: Show photo
- Without image: Initials + color
- Loading: Skeleton shimmer
```

**Group Avatar** (Overlap)
```tsx
Multiple avatars overlapping:
┌─────────┐
│ A │ B │   +3
└─────────┘

Layout:
- First 3 avatars shown
- Overlap: -8px (shows edge of each)
- "+X more" badge if > 3 people
- Size: 32px per avatar
```

#### 5. Badges & Status Indicators

**Status Badge**
```tsx
Appearance:
- Padding: 4px 8px
- Border Radius: 6px (sm)
- Font: 12px, Medium
- Height: 24px

Variants:
1. Settled (Green)
   - Background: rgba(16, 185, 129, 0.15)
   - Text: #34D399
   - Icon: Checkmark

2. Pending (Amber)
   - Background: rgba(245, 158, 11, 0.15)
   - Text: #FBBF24
   - Icon: Clock

3. Overdue (Red) - for future reminders
   - Background: rgba(239, 68, 68, 0.15)
   - Text: #F87171
   - Icon: Alert
```

**Notification Badge** (Count)
```tsx
Appearance:
- Size: 18px circle
- Background: Red (#EF4444)
- Text: White, 11px, Bold
- Position: Top right of icon (-4px, -4px)

States:
- 1-9: Show number
- 10-99: Show number
- 100+: Show "99+"
```

#### 6. Bottom Sheet / Modal

**Bottom Sheet**
```tsx
Appearance:
- Background: #1A1A1F (elevated)
- Border Radius: 24px (top corners only)
- Padding: 20px
- Handle: 32px wide, 4px tall, gray pill at top

Animation:
- Slide up from bottom (300ms, easeOut)
- Backdrop: rgba(0, 0, 0, 0.5) fade in
- Dismiss: Swipe down or tap outside

Usage:
- Add Expense
- Settle Up
- Filter options
- Action sheets
```

#### 7. Empty States

**Structure**
```tsx
Layout:
┌────────────────────────────┐
│                            │
│      [Illustration]        │
│                            │
│      Headline Text         │
│   Description (optional)   │
│                            │
│      [CTA Button]          │
│                            │
└────────────────────────────┘

Specs:
- Illustration: 120px x 120px (centered)
- Headline: 20px, Semibold, white
- Description: 14px, Regular, 60% opacity
- CTA: Primary button
- Spacing: 24px between elements

Examples:
1. No Expenses Yet
   - Illustration: Empty wallet
   - Headline: "No expenses yet"
   - Description: "Tap + to add your first one"
   - CTA: "Add Expense"

2. No Friends Yet
   - Illustration: People connecting
   - Headline: "No friends added"
   - Description: "Invite friends to start splitting bills"
   - CTA: "Add Friends"
```

---

## IV. Screen Specifications

### 1. Onboarding Screens

#### Screen 1: Welcome Splash

**Purpose**: First impression, value proposition

**Layout**:
```
┌───────────────────────────────────┐
│                                   │
│                                   │
│      [Hero Illustration]          │
│     (Friends splitting bill)      │
│                                   │
│                                   │
│   Split bills, not friendships    │ ← H1
│                                   │
│  Fair, fast, and drama-free       │ ← Body
│       expense splitting           │
│                                   │
│                                   │
│      [Get Started Button]         │ ← Primary
│                                   │
│   Already have an account? Log in │ ← Text button
│                                   │
└───────────────────────────────────┘
```

**Illustration Style**:
- Flat design with warm gradients
- 3-4 friends around table
- Receipt floating in center
- Terracotta and olive color scheme (earthy, warm tones)
- Happy, relaxed mood

**Interactions**:
- "Get Started": → Value Prop screens
- "Log in": → Login flow (future)

---

#### Screens 2-4: Value Proposition (Swipeable)

**Screen 2: We Handle the Math**

```
┌───────────────────────────────────┐
│                              [Skip]│ ← Text button
│                                   │
│      [Calculator Illustration]    │
│     (with checkmarks)             │
│                                   │
│      We handle the math           │ ← H1
│                                   │
│  Split equally, by percentage,    │ ← Body
│  or custom amounts. We'll make    │
│  sure it's fair.                  │
│                                   │
│         ● ○ ○                     │ ← Progress dots
│                                   │
│      [Next Button]                │ ← Primary
│                                   │
└───────────────────────────────────┘
```

**Screen 3: Get Paid Instantly**

```
Same layout but:
- Illustration: Phone with UPI payment
- Headline: "Get paid instantly"
- Description: "Send payment links via WhatsApp, UPI apps, or any messenger."
- Progress: ○ ● ○
```

**Screen 4: Everyone Sees Everything**

```
Same layout but:
- Illustration: Transparent ledger
- Headline: "Everyone sees everything"
- Description: "Complete transparency. No confusion, no arguments."
- Progress: ○ ○ ●
- Button: "Start Splitting" (instead of Next)
```

**Interactions**:
- Swipe left/right: Navigate between screens
- "Skip": → Quick Signup
- "Next" / "Start Splitting": → Quick Signup

---

#### Screen 5: Quick Signup

**Layout**:
```
┌───────────────────────────────────┐
│ [Back]                            │
│                                   │
│   Let's get you started           │ ← H1
│                                   │
│   What should we call you?        │ ← Label
│   [Name Input]                    │
│                                   │
│   Your phone number               │ ← Label
│   [Phone Input]                   │
│   (We'll send a verification code)│ ← Caption
│                                   │
│   ⬜ Set up Face ID                │ ← Optional checkbox
│   (70% faster login)              │
│                                   │
│   🔒 Your data is encrypted       │ ← Trust message
│       and private                 │
│                                   │
│      [Create Account]             │ ← Primary (disabled until valid)
│                                   │
└───────────────────────────────────┘
```

**Validation**:
- Name: Required, 2-50 characters
- Phone: Required, valid format
- Biometric: Optional (can skip)

**Interactions**:
- "Create Account": → Dashboard (first-time user)
- Auto-focus: Name input on screen appear

---

### 2. Dashboard / Home Screen

**Purpose**: Balance overview, quick actions, recent activity

**Layout**:
```
┌───────────────────────────────────┐
│ Welcome back, Nikunj    [⚙️]      │ ← Header
│ January 20, 2025                  │
│                                   │
│ ┌─────────────────────────────┐   │
│ │ 🌅 Your Balance              │   │ ← Balance Card (Gradient)
│ │                              │   │
│ │ You're owed    ₹2,450 ↗      │   │ ← Green
│ │ You owe          ₹890 ↘      │   │ ← Amber
│ │                              │   │
│ │ Net Balance                  │   │
│ │ ₹1,560 to collect            │   │ ← Large, animated
│ └─────────────────────────────┘   │
│                                   │
│ Recent Activity                   │ ← Section header
│                                   │
│ ┌─────────────────────────────┐   │
│ │ [A] Sarah    ₹450 | Pending  │   │ ← Transaction card
│ │     Dinner   2 hours ago     │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [R] Rahul    ₹800 | Settled  │   │
│ │     Movie    Yesterday       │   │
│ └─────────────────────────────┘   │
│                                   │
│ View All →                        │ ← Text button
│                                   │
│ [Home] [Friends] [+] [Activity] […]│ ← Tab Bar
└───────────────────────────────────┘
```

**Balance Card Specs**:
- Gradient: Terracotta (#C2662D) → Olive (#6B7C4A)
- Padding: 24px
- Border Radius: 24px
- Shadow: lg + terracotta glow
- Numbers: Animated counting on load (odometer effect)

**Quick Actions** (Floating above balance card):
```
┌──────────────────────────────┐
│  [Settle]  [➕ADD]  [Request] │
└──────────────────────────────┘

Positioned: Absolute, centered, -24px from bottom of balance card
```

**Recent Activity**:
- Show last 5 transactions
- Each card: 72px height
- Gap: 12px between cards
- Swipe left: "Settle Up" action
- Tap: → Expense Detail

**Empty State** (No expenses):
```
┌───────────────────────────────────┐
│                                   │
│      [Empty Wallet Illustration]  │
│                                   │
│      No expenses yet              │
│   Tap + to add your first one     │
│                                   │
│      [Add Expense]                │
│                                   │
└───────────────────────────────────┘
```

---

### 3. Add Expense Modal

**Purpose**: Primary action - add new expense to split

**Layout**:
```
┌───────────────────────────────────┐
│ [Handle]                    [✕]   │ ← Swipe handle + Close
│                                   │
│ Add Expense                       │ ← H2
│                                   │
│ Amount                            │ ← Label
│ ₹ [_________]                     │ ← Large amount input
│                                   │
│ [₹100] [₹500] [₹1K] [₹2K]         │ ← Quick buttons
│                                   │
│ What's this for?                  │ ← Label
│ [Dinner at Taj______]             │ ← Text input
│                                   │
│ Category                          │ ← Label
│ 🍽️ 🚗 🏠 🎬 🛒 📱               │ ← Icon grid
│                                   │
│ Split with                        │ ← Label
│ ┌──────────────────────────────┐  │
│ │ [S] Sarah     [+] Add More   │  │ ← Participant chips
│ │ [R] Rahul                    │  │
│ └──────────────────────────────┘  │
│                                   │
│ Split Method                      │ ← Label
│ ⚫ Split Equally (₹750 each)      │ ← Radio selected
│ ⚪ Custom Split                   │ ← Radio
│                                   │
│ [Add Expense]                     │ ← Primary button (bottom)
│                                   │
└───────────────────────────────────┘
```

**Behavior**:
- Auto-focus: Amount input on open
- Keyboard: Numeric for amount
- Quick buttons: Fill amount instantly
- Category: Optional, single select
- Participants: Minimum 2 required
- Split method: Equal is default
- Validation: Real-time, inline errors
- Success: Dismiss + celebration animation + toast

**Custom Split** (Expanded):
```
When "Custom Split" selected:

┌──────────────────────────────────┐
│ Sarah        ₹ [_______] 􀁱        │ ← Amount input per person
│ Rahul        ₹ [_______] 􀁱        │
│ You          ₹ [_______] 􀁱        │
│                                  │
│ Remaining: ₹0                    │ ← Live calculation
│ (₹1,500 of ₹1,500 assigned)      │
└──────────────────────────────────┘
```

---

### 4. Friends Screen

**Purpose**: Manage people you split expenses with

**Layout**:
```
┌───────────────────────────────────┐
│ Friends                      [+]  │ ← Header + Add button
│                                   │
│ [Search friends...]               │ ← Search input
│                                   │
│ You're Owed  (3)                  │ ← Section
│ ┌─────────────────────────────┐   │
│ │ [S] Sarah        ₹450 →     │   │ ← Friend card (green amount)
│ │     3 expenses              │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [A] Amit         ₹1,200 →   │   │
│ │     5 expenses              │   │
│ └─────────────────────────────┘   │
│                                   │
│ You Owe  (2)                      │ ← Section
│ ┌─────────────────────────────┐   │
│ │ [R] Rahul        ₹890 →     │   │ ← Friend card (amber amount)
│ │     2 expenses              │   │
│ └─────────────────────────────┘   │
│                                   │
│ Settled  (8)                      │ ← Section (collapsible)
│ [Show settled friends ▼]          │
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

**Friend Card**:
- Avatar: 48px (Medium size)
- Name: 16px, Semibold
- Balance: 16px, Medium, color-coded
- Expense count: 14px, 60% opacity
- Arrow: Indicates tap action

**Sections**:
- "You're Owed": Green positive amounts
- "You Owe": Amber negative amounts
- "Settled": Collapsed by default (₹0 balance)

**Empty State**:
```
┌───────────────────────────────────┐
│                                   │
│   [People Connecting Illustration]│
│                                   │
│      No friends yet               │
│   Add friends to start splitting  │
│                                   │
│      [Add Friend]                 │
│                                   │
└───────────────────────────────────┘
```

**Add Friend Flow** (Modal):
```
┌───────────────────────────────────┐
│ Add Friend                   [✕]  │
│                                   │
│ ⚪ From Contacts                   │ ← Radio
│ ⚫ Enter Manually                  │ ← Selected
│                                   │
│ Name                              │
│ [______________]                  │
│                                   │
│ Phone (optional)                  │
│ [______________]                  │
│                                   │
│ [Add Friend]                      │
│                                   │
└───────────────────────────────────┘
```

---

### 5. Friend Detail Screen

**Purpose**: View history and balance with a specific friend

**Layout**:
```
┌───────────────────────────────────┐
│ [←]                         [...] │ ← Back + Actions menu
│                                   │
│       [S]                         │ ← Large avatar (96px)
│      Sarah                        │ ← H1
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Balance                      │   │ ← Balance card
│ │                              │   │
│ │ Sarah owes you               │   │
│ │ ₹450                         │   │ ← Large, green
│ │                              │   │
│ │ [Settle Up] [Remind]         │   │ ← Action buttons
│ └─────────────────────────────┘   │
│                                   │
│ History  (3 expenses)             │ ← Section
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Dinner at Taj    ₹450        │   │ ← Expense card
│ │ Jan 20, 2025     Pending     │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ Movie Tickets    ₹400        │   │
│ │ Jan 18, 2025     Settled     │   │
│ └─────────────────────────────┘   │
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

**Actions Menu** (...):
- Edit friend name
- Delete friend (with confirmation)
- Export history with friend

**Balance Card**:
- Shows net balance (Sarah owes you OR You owe Sarah)
- Color-coded amount
- Action buttons:
  - "Settle Up": → Payment modal
  - "Remind": Send payment reminder via WhatsApp/SMS

---

### 6. Activity / History Screen

**Purpose**: Complete transaction history with search and filters

**Layout**:
```
┌───────────────────────────────────┐
│ Activity                    [🔍]  │ ← Header + Search icon
│                                   │
│ [All] [Pending] [Settled]         │ ← Filter tabs
│                                   │
│ Today                             │ ← Date section
│ ┌─────────────────────────────┐   │
│ │ [S] Sarah    ₹450 | Pending  │   │
│ │     Dinner   2 hours ago     │   │
│ └─────────────────────────────┘   │
│                                   │
│ Yesterday                         │ ← Date section
│ ┌─────────────────────────────┐   │
│ │ [R] Rahul    ₹800 | Settled  │   │
│ │     Movie    Yesterday       │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [A] Amit     ₹600 | Pending  │   │
│ │     Lunch    Yesterday       │   │
│ └─────────────────────────────┘   │
│                                   │
│ This Week                         │
│ [Load more...]                    │
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

**Filter Tabs**:
- All: Shows everything
- Pending: Only unsettled expenses
- Settled: Only completed payments

**Search** (Tap 🔍):
```
Expands to:
┌───────────────────────────────────┐
│ [←] [Search expenses...]    [✕]  │
│                                   │
│ Recent Searches                   │
│ • Dinner                          │
│ • Movie                           │
│                                   │
│ [Search results appear here]      │
└───────────────────────────────────┘
```

**Empty State** (No transactions):
```
┌───────────────────────────────────┐
│                                   │
│   [Calendar with Checkmark]       │
│                                   │
│      All caught up!               │
│   No pending expenses             │
│                                   │
└───────────────────────────────────┘
```

---

### 7. Expense Detail Screen

**Purpose**: Full breakdown of a specific expense

**Layout**:
```
┌───────────────────────────────────┐
│ [←]                         [...] │ ← Back + Actions
│                                   │
│ 🍽️ Dinner at Taj                 │ ← Category + Title (H1)
│ ₹1,500                            │ ← Total amount
│ Jan 20, 2025                      │ ← Date
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Split 3 ways                 │   │ ← Split summary card
│ │                              │   │
│ │ [S] Sarah      ₹500 Pending  │   │ ← Each person
│ │ [R] Rahul      ₹500 Pending  │   │
│ │ [Y] You        ₹500 Paid     │   │ ← Green checkmark
│ └─────────────────────────────┘   │
│                                   │
│ Receipt                           │ ← Section (if uploaded)
│ [📸 Image thumbnail]              │
│                                   │
│ Notes                             │ ← Section (if added)
│ "Great food, must return!"        │
│                                   │
│ [Settle Up]                       │ ← Primary action (if pending)
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

**Actions Menu** (...):
- Edit expense (if creator)
- Delete expense (if creator, with confirmation)
- Duplicate expense
- Share details (export as text)

**Split Summary**:
- Each participant with avatar
- Amount they owe/owed
- Status badge (Pending/Settled)
- Tap person: → Settle up for that person

---

### 8. Settle Up Modal

**Purpose**: Record payment or send payment link

**Layout**:
```
┌───────────────────────────────────┐
│ [Handle]                    [✕]   │
│                                   │
│ Settle Up with Sarah              │ ← H2
│                                   │
│ Amount to settle                  │
│ ₹450                              │ ← Large, prominent
│                                   │
│ How did you pay?                  │ ← Label
│                                   │
│ ⚪ UPI Payment                     │ ← Radio options
│ ⚪ Bank Transfer                   │
│ ⚫ Cash                            │ ← Selected
│ ⚪ Other                           │
│                                   │
│ [If UPI selected:]                │
│ ┌──────────────────────────────┐  │
│ │ 📱 GPay    📱 PhonePe         │  │ ← UPI app buttons
│ │ 📱 Paytm   📱 Other UPI       │  │
│ └──────────────────────────────┘  │
│                                   │
│ Add note (optional)               │
│ [Paid for dinner_____]            │ ← Text input
│                                   │
│ [Mark as Paid]                    │ ← Primary button
│                                   │
└───────────────────────────────────┘
```

**Behavior**:
- If UPI selected: Show UPI app buttons
  - Tap app: Open deep link to that UPI app with pre-filled payment
- If manual (Cash, Other): Just record in app
- On "Mark as Paid":
  - Update balance
  - Send notification to friend
  - Celebration animation if fully settled
  - Dismiss modal

---

### 9. Profile Screen

**Purpose**: User settings, insights, and account management

**Layout**:
```
┌───────────────────────────────────┐
│ Profile                           │ ← Header
│                                   │
│       [N]                         │ ← Large avatar
│      Nikunj                       │ ← Name
│  nikunj@example.com               │ ← Email/phone
│                                   │
│ [Edit Profile]                    │ ← Secondary button
│                                   │
│ ┌─────────────────────────────┐   │
│ │ 📊 Spending Insights        │   │ ← Card
│ │ See where your money goes    │   │
│ │                          →   │   │
│ └─────────────────────────────┘   │
│                                   │
│ Settings                          │ ← Section
│ ⚙️ Account Settings          →   │ ← List item
│ 💳 Payment Preferences       →   │
│ 🔔 Notifications             →   │
│ 🔒 Privacy & Security        →   │
│                                   │
│ Support                           │ ← Section
│ ❓ Help & FAQs               →   │
│ 💬 Contact Support           →   │
│ ℹ️ About Vasooly             →   │
│                                   │
│ [Sign Out]                        │ ← Text button (red)
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

**Spending Insights Card**:
- Gradient background (subtle terracotta → olive)
- Tap: → Spending Insights Dashboard (NEW screen)

**List Items**:
- Icon (left), Label (center), Arrow (right)
- 56px height
- Tap: Navigate to respective settings screen

---

### 10. Spending Insights Dashboard (NEW)

**Purpose**: Financial wellness - show spending patterns

**Layout**:
```
┌───────────────────────────────────┐
│ [←] Spending Insights             │ ← Header
│                                   │
│ January 2025                 [⌄]  │ ← Month selector
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Total Expenses               │   │ ← Summary card
│ │ ₹12,450                      │   │ ← Large number
│ │                              │   │
│ │ ↗ 23% more than last month   │   │ ← Trend
│ └─────────────────────────────┘   │
│                                   │
│ By Category                       │ ← Section
│ ┌─────────────────────────────┐   │
│ │     [Pie Chart]              │   │ ← Interactive chart
│ │   45% Food & Dining          │   │
│ │   25% Transport              │   │
│ │   20% Entertainment          │   │
│ │   10% Other                  │   │
│ └─────────────────────────────┘   │
│                                   │
│ Top Expenses                      │ ← Section
│ ┌─────────────────────────────┐   │
│ │ 🍽️ Food & Dining    ₹5,600  │   │ ← Category breakdown
│ │ 23 expenses                  │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ 🚗 Transport        ₹3,100  │   │
│ │ 12 expenses                  │   │
│ └─────────────────────────────┘   │
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

**Features**:
- Month selector (dropdown to pick month)
- Total expenses with trend comparison
- Pie chart showing category breakdown
- Interactive: Tap segment → filter expenses by category
- Top categories list with counts

**Scroll Down** (More insights):
```
│ Spending Trend                    │
│ [Line Chart - Last 6 months]      │
│                                   │
│ Frequent Friends                  │
│ [A] Amit - 12 expenses            │
│ [S] Sarah - 8 expenses            │
│                                   │
│ [Export Data] [Share Insights]    │
```

---

## V. Premium Feature Specifications

### Feature 1: Visual Debt Network (UNIQUE!)

**Purpose**: Simplify complex group debts with visual graph

**When to Show**:
- Groups with 3+ people
- Multiple interconnected debts
- Dashboard "Net Balance" card tap

**Layout**:
```
┌───────────────────────────────────┐
│ Debt Network                      │
│                                   │
│        [You]                      │ ← Center node (You)
│       /  │  \                     │
│      /   │   \                    │
│  [Sarah][Amit][Rahul]             │ ← Friend nodes
│   +₹450 -₹600 -₹200               │ ← Amounts (color-coded)
│                                   │
│  Green arrows: They owe you       │
│  Amber arrows: You owe them       │
│                                   │
│  Tap a person to settle up        │ ← Instructions
│                                   │
└───────────────────────────────────┘
```

**Visual Elements**:
- Nodes: Circles with avatars
- Edges: Lines with arrows (directional)
- Colors:
  - Green: Money flowing to you
  - Amber: Money flowing from you
- Thickness: Line width = amount (thicker = larger debt)

**Interactions**:
- Tap node (friend): → Friend Detail
- Pinch to zoom: Scale graph
- Pan: Move around if many people

**Algorithm**: Simplify debts
```
Example:
- Sarah owes you ₹500
- You owe Amit ₹500
- Simplified: Sarah pays Amit ₹500 directly

Show simplified network by default
Toggle: "Show all debts" vs "Show simplified"
```

---

### Feature 2: Smart Split Suggestions

**Purpose**: AI suggests fair splits based on context

**When to Show**: Add Expense modal, after entering amount

**Examples**:

**Scenario 1: Recent Similar Expense**
```
You recently split a ₹1,200 dinner with Sarah and Rahul.
Now adding ₹1,500 dinner expense.

Suggestion appears:
┌──────────────────────────────────┐
│ 💡 Split like last time?          │
│ Sarah, Rahul, and You (3-way)    │
│                                  │
│ [Yes, Use This] [No, Thanks]     │
└──────────────────────────────────┘
```

**Scenario 2: Frequent Group**
```
You often split with Sarah and Amit.

Suggestion:
┌──────────────────────────────────┐
│ 💡 Your usual group?              │
│ Sarah and Amit                   │
│                                  │
│ [Add Them] [No, Thanks]          │
└──────────────────────────────────┘
```

**Scenario 3: Round Numbers**
```
Amount entered: ₹1,497

Suggestion:
┌──────────────────────────────────┐
│ 💡 Round to ₹1,500?               │
│ Easier to split evenly           │
│                                  │
│ [Round Up] [Keep ₹1,497]         │
└──────────────────────────────────┘
```

**Scenario 4: Category-Based**
```
Category: Food & Dining
Time: 8 PM

Suggestion:
┌──────────────────────────────────┐
│ 💡 Dinner split?                  │
│ Based on category and time       │
│ Split with dinner buddies?       │
│                                  │
│ [Yes] [No]                       │
└──────────────────────────────────┘
```

**Implementation**:
- Machine learning model (simple rules-based initially)
- Learn from user patterns over time
- Always show "No, Thanks" option (not pushy)
- Dismissible (don't show again for this session)

---

### Feature 3: Receipt Scanner (Premium)

**Purpose**: OCR to extract amount and details from receipt photo

**Entry Point**: Add Expense modal

**UI Addition**:
```
Add Expense modal, top right:
┌───────────────────────────────────┐
│ Add Expense             [📷]      │ ← Camera icon
│                                   │
```

**Flow**:
```
1. Tap camera icon
↓
2. Camera viewfinder opens
   - Grid overlay for alignment
   - "Center receipt in frame"
   - [Capture] button
↓
3. Take photo
   - Brief processing animation
   - "Scanning receipt..."
↓
4. OCR extraction
   - Amount: ₹1,245 (detected)
   - Merchant: "Taj Restaurant" (detected)
   - Date: Jan 20, 2025 (detected)
↓
5. Review & adjust
┌──────────────────────────────────┐
│ Scanned Receipt                  │
│                                  │
│ [Receipt preview image]          │
│                                  │
│ Amount: ₹ [1245____] ✓           │ ← Editable, confirmed
│ Place:  [Taj Restaurant__] ✓     │
│ Date:   [Jan 20, 2025____] ✓     │
│                                  │
│ [Use These Details] [Rescan]     │
└──────────────────────────────────┘
↓
6. Auto-fill Add Expense form
   - Amount: ₹1,245
   - Title: "Taj Restaurant"
   - Date: Jan 20
   - User continues with participants, etc.
```

**Premium Indicator**:
- Show badge: "✨ Premium Feature"
- Free tier: 3 scans per month
- Premium: Unlimited scans
- Paywall: "Unlock unlimited scans"

---

### Feature 4: Recurring Expenses

**Purpose**: Auto-split monthly bills (rent, subscriptions)

**Setup Flow**:
```
1. Add Expense modal → "Set as recurring" toggle
↓
2. Recurring options appear:
┌──────────────────────────────────┐
│ Repeat                           │
│ ⚫ Monthly                        │ ← Selected
│ ⚪ Weekly                         │
│ ⚪ Custom                         │
│                                  │
│ Start Date                       │
│ [Jan 25, 2025________]           │
│                                  │
│ End                              │
│ ⚫ Never                          │
│ ⚪ After X times                  │
│ ⚪ On date                        │
│                                  │
│ [Save Recurring Expense]         │
└──────────────────────────────────┘
↓
3. Confirmation
"Rent will be added automatically on the 25th of each month."
↓
4. Automatic creation
- On 25th: Creates expense automatically
- Sends notifications to all participants
- Appears in activity feed
```

**Management**:
```
Profile → Recurring Expenses
┌──────────────────────────────────┐
│ Active Recurring (2)             │
│                                  │
│ 🏠 Rent - ₹30,000               │
│ Split with Sarah, Amit           │
│ Every month on 25th              │
│ [Edit] [Delete]                  │
│                                  │
│ 📱 Netflix - ₹200               │
│ Split with Sarah                 │
│ Every month on 1st               │
│ [Edit] [Delete]                  │
└──────────────────────────────────┘
```

**Notifications** (Day before):
```
Push notification:
"💡 Rent (₹30,000) will be added tomorrow.
Everyone will be notified."

[View] [Modify] [Skip This Month]
```

---

## VI. Animation & Interaction Specifications

### Animation Timing Standards

```typescript
durations: {
  instant: 0,       // No animation
  fast: 200,        // Button presses, toggles
  normal: 300,      // Modals, transitions
  slow: 400,        // Page transitions, heavy animations
}

easings: {
  easeOut: Easing.out(Easing.ease),     // Exits, dismissals
  easeIn: Easing.in(Easing.ease),       // Entries
  easeInOut: Easing.inOut(Easing.ease), // Transitions
  spring: springConfigs.gentle,          // Bouncy, natural
}
```

### Key Animation Moments

#### 1. Onboarding Transitions

```typescript
// Swipe between value prop screens
Animation:
  Type: Slide
  Duration: 300ms
  Easing: easeInOut
  Direction: Horizontal
  Transform: translateX(-100% → 0%)

// Progress dots
Animation:
  Type: Scale + Fade
  Duration: 200ms
  Easing: spring
  From: scale(0.8), opacity(0.5)
  To: scale(1.0), opacity(1.0)
```

#### 2. Dashboard Entry

```typescript
// Balance number counting
Animation:
  Type: Number count (odometer effect)
  Duration: 800ms
  Easing: easeOut
  From: 0
  To: Actual balance value
  Custom: Increment gradually (0 → 100 → 500 → 1560)

// Recent activity cards
Animation:
  Type: Stagger fade + slide
  Delay: 100ms between cards
  Duration: 300ms
  Transform: translateY(20px → 0), opacity(0 → 1)
```

#### 3. Add Expense Modal

```typescript
// Modal present
Animation:
  Type: Slide from bottom
  Duration: 300ms
  Easing: easeOut
  Transform: translateY(100% → 0%)
  Backdrop: Fade in opacity(0 → 0.5)

// Amount input number changes
Animation:
  Type: Spring
  Config: gentle
  Transform: Scale(1.05 → 1.0)

// Quick amount button press
Animation:
  Type: Scale + Haptic
  Duration: 200ms
  Transform: scale(0.95)
  Haptic: light feedback
```

#### 4. Settlement Celebration

```typescript
// When marking as paid
Animation:
  Type: Checkmark draw + confetti
  Duration: 600ms
  Steps:
    1. Checkmark draws in (stroke animation)
    2. Confetti particles emit (20-30 particles)
    3. Balance number updates with count animation
  Haptic: success (double tap pattern)

// Confetti specs
Particles: 25
Colors: [olive green, terracotta, amber, cream]
Physics: Gravity + random horizontal velocity
Lifetime: 1000ms (fade out at end)
```

#### 5. Swipe Actions

```typescript
// Swipe to reveal action
Animation:
  Type: Progressive reveal
  Gesture: Pan gesture
  Transform: translateX based on gesture
  Threshold: 60px to trigger
  Haptic: light (at threshold)

  States:
  - 0-60px: Partial reveal (elastic)
  - >60px: Snap to action (spring)
  - Release < threshold: Spring back to 0
```

#### 6. Pull to Refresh

```typescript
// Custom branded pull to refresh
Animation:
  Type: Rotate + scale
  Icon: Vasooly logo
  Behavior:
    Pull 0-60px: Logo rotates (0 → 180deg)
    At 60px: Logo scales up (1.0 → 1.2) + haptic
    Release: Spinner animation while loading
    Complete: Success haptic + fade out
```

---

## VII. Implementation Roadmap

### Phase 2A: UI/UX Revamp (4-6 weeks)

**Week 1: Design Foundation**
- [ ] Finalize brand identity
  - [ ] Color system (terracotta + olive earthen identity)
  - [ ] Typography (Inter font with full scale)
  - [ ] Voice & tone guidelines
- [ ] Create Figma design system
  - [ ] Component library (buttons, inputs, cards, etc.)
  - [ ] Color tokens and typography styles
  - [ ] Spacing and layout grids
- [ ] Icon library
  - [ ] Custom financial icons (10 icons)
  - [ ] Integrate Lucide for common actions
  - [ ] Special Add (+) button design
- [ ] Illustration style guide
  - [ ] Create 6-8 key illustrations (onboarding, empty states)
  - [ ] Define color palette and style

**Week 2: Core Screens Design**
- [ ] Onboarding flow (4-6 screens)
  - [ ] Welcome splash
  - [ ] Value proposition screens (3)
  - [ ] Quick signup
- [ ] Dashboard/Home redesign
  - [ ] Balance card with gradient
  - [ ] Quick actions layout
  - [ ] Recent activity feed
- [ ] Friends screen (NEW)
  - [ ] Friend list with sections
  - [ ] Add friend flow
- [ ] Bottom tab navigation
  - [ ] 5-tab structure
  - [ ] Special center (+) button
  - [ ] Tab states and animations

**Week 3: Implementation - Tier 1**
- [ ] Design system components
  - [ ] Button variants (primary, secondary, text, icon)
  - [ ] Input components (text, amount, search)
  - [ ] Card components (balance, transaction, friend)
  - [ ] Avatar system (user, group, sizes)
  - [ ] Badges and status indicators
- [ ] Onboarding screens
  - [ ] Implement 4-6 screens with navigation
  - [ ] Illustrations integration
  - [ ] Skip/Next button flows
- [ ] Dashboard implementation
  - [ ] Balance card with animated numbers
  - [ ] Recent activity feed
  - [ ] Pull to refresh

**Week 4: Implementation - Tier 2**
- [ ] Friends screen
  - [ ] Friend list with sections
  - [ ] Search functionality
  - [ ] Add friend flow
  - [ ] Friend detail screen
- [ ] Add Expense modal redesign
  - [ ] New layout with better UX
  - [ ] Quick amount buttons
  - [ ] Category selection
  - [ ] Live split calculation
- [ ] Update existing screens
  - [ ] BillDetail → Expense Detail
  - [ ] Settings screen refinement
  - [ ] Activity screen with filters

**Week 5: Premium Features**
- [ ] Spending Insights dashboard
  - [ ] Pie chart integration (recharts or react-native-chart-kit)
  - [ ] Category breakdowns
  - [ ] Monthly trends
- [ ] Visual debt network (Phase 1: Simple version)
  - [ ] Basic graph visualization
  - [ ] Interactive nodes
- [ ] Enhanced animations
  - [ ] Number counting (odometer)
  - [ ] Celebration confetti
  - [ ] Swipe actions
  - [ ] Pull to refresh custom animation

**Week 6: Polish & Refinement**
- [ ] Micro-interactions
  - [ ] All button press animations
  - [ ] Input focus states
  - [ ] Loading states
  - [ ] Skeleton screens
- [ ] Empty states
  - [ ] Illustrations for all empty states
  - [ ] Helpful copy and CTAs
- [ ] Error handling
  - [ ] Friendly error messages
  - [ ] Network error states
  - [ ] Validation errors
- [ ] Dark mode refinement
  - [ ] Ensure all new colors work in dark mode
  - [ ] Test contrast ratios (WCAG AA)
- [ ] Accessibility audit
  - [ ] Screen reader labels
  - [ ] Touch target sizes (44x44 minimum)
  - [ ] Color contrast
  - [ ] Reduce motion support

---

### Dependencies & Resources

**Design Tools**:
- Figma (design system and screen mockups)
- Illustrator or Figma (illustration creation)
- Lucide Icons library
- ColorBox (color palette generation)

**React Native Libraries**:
- `react-navigation/bottom-tabs` (tab navigation)
- `react-native-reanimated` (animations) ✅ Already have
- `expo-haptics` (haptic feedback) ✅ Already have
- `react-native-chart-kit` or `victory-native` (charts for insights)
- `react-native-svg` (SVG rendering) ✅ Already have
- `lottie-react-native` (optional for complex animations)

**Development Team**:
- 1 Designer (design system + mockups)
- 1-2 Frontend developers (implementation)
- 1 QA tester (accessibility and UX testing)

**Estimated Effort**:
- Design: 80-100 hours (2-2.5 weeks full-time)
- Development: 120-160 hours (3-4 weeks full-time)
- Total: 200-260 hours (5-6.5 weeks full-time)

---

## VIII. Success Metrics

### Design Quality Metrics

**Visual Consistency**:
- ✅ All colors use design tokens (no hardcoded hex)
- ✅ Typography follows scale (no arbitrary sizes)
- ✅ Spacing uses 8px grid (no random gaps)
- ✅ Border radius uses system values
- ✅ Shadows use elevation system

**Accessibility**:
- ✅ Color contrast ≥ 4.5:1 (WCAG AA)
- ✅ Touch targets ≥ 44x44px
- ✅ Screen reader labels on all interactive elements
- ✅ Reduce motion support (animations disabled for motion sensitivity)
- ✅ Semantic HTML/accessibility labels

**User Experience**:
- ⏱️ Onboarding completion: <60 seconds (target <45s)
- ⏱️ Time to first expense: <2 minutes
- 🎯 Onboarding abandonment: <15% (industry standard 30-40%)
- 📊 User satisfaction (NPS): >50 (target >60)
- 🔄 Retention: >40% week-4 retention

**Performance**:
- ⚡ App launch: <2 seconds
- ⚡ Screen transitions: 60fps (no dropped frames)
- ⚡ Modal animations: Smooth (perceived as instant)
- 📦 App size: <50MB (optimized assets)

---

## IX. Next Steps

### Immediate Actions (Before Implementation)

1. **Get User Feedback on This Document**
   - Review all screen designs
   - Validate brand identity choices
   - Prioritize features (must-have vs nice-to-have)
   - Timeline approval

2. **Create Figma Mockups**
   - Design system library
   - All 12 screen mockups
   - Interactive prototype for key flows
   - Developer handoff annotations

3. **Technical Feasibility Check**
   - Verify chart library choices
   - Test complex animations on mid-range devices
   - Estimate bundle size impact
   - Confirm all dependencies compatible with Expo SDK 54

4. **Update Implementation Plan**
   - Insert Phase 2A before current Phase 3
   - Adjust timeline (4-6 week addition)
   - Resource allocation
   - Go/No-Go decision point

### Decision Point

**Option 1: Full UI Revamp (Recommended)**
- 4-6 weeks additional time
- Launch with world-class UI
- Higher user retention and satisfaction
- Better competitive positioning

**Option 2: Hybrid Approach**
- 2-3 weeks essential updates
- Launch with good (not perfect) UI
- Iterate post-launch based on feedback
- Faster to market but higher risk

**Option 3: Ship Current UI**
- No delay
- Launch immediately after Phase 3 testing
- Risk: Poor first impressions, low retention
- Not recommended for competitive market

---

**Document Version**: 2.0
**Last Updated**: January 20, 2025
**Next Review**: After user feedback and Figma mockups
**Status**: ✅ **COMPLETE - READY FOR REVIEW & APPROVAL**
