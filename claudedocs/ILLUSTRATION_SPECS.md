# Vasooly Illustration Specifications

**Purpose**: Comprehensive illustration requirements for Vasooly app using earthen design system
**Style**: Line art with minimal color, friendly and approachable
**Format**: SVG vector illustrations
**Last Updated**: 2025-10-20

---

## Table of Contents

1. [Illustration Style Guide](#illustration-style-guide)
2. [Empty State Illustrations](#empty-state-illustrations)
3. [Onboarding Illustrations](#onboarding-illustrations)
4. [Error State Illustrations](#error-state-illustrations)
5. [Celebration Illustrations](#celebration-illustrations)
6. [Technical Specifications](#technical-specifications)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Illustration Style Guide

### Visual Style

**Primary Style**: Line art with minimal color fills
**Personality**: Friendly, approachable, warm, reassuring
**Complexity**: Simple and clean, avoid visual clutter
**Character Design**: Rounded, friendly shapes; minimal detail; expressive poses

### Color Palette (Earthen Design System)

**Line Colors**:
- Primary lines: `Terracotta 700` (#9A4C32) - main illustration strokes
- Secondary lines: `Terracotta 600` (#B85A3B) - lighter accent strokes
- Tertiary lines: `Neutral 600` (#6F5F51) - subtle detail strokes

**Fill Colors** (use sparingly):
- Primary fills: `Terracotta 200` (#F4C9B4) - warm highlights
- Accent fills: `Olive 100` (#EEF0E9) - natural, calm backgrounds
- Neutral fills: `Neutral 100` (#F5F3F0) - subtle shape fills
- Success fills: `Olive 200` (#DCE1D3) - positive states

**Background Elements**:
- Geometric shapes: `Neutral 200` (#E8E4DF) - very subtle
- Decorative elements: `Terracotta 100` (#F9E5DC) - soft warmth

### Line Specifications

**Stroke Weights**:
- Primary elements: 2.5px stroke
- Secondary elements: 2px stroke
- Fine details: 1.5px stroke

**Stroke Properties**:
- Line cap: `round`
- Line join: `round`
- Miter limit: 4

**Style Characteristics**:
- Continuous, flowing lines
- Rounded corners throughout
- Minimal sharp angles
- Hand-drawn feeling (slight imperfections acceptable)

### Sizing Standards

**Mobile (Default)**:
- Empty states: 240x240px
- Onboarding: 280x280px
- Error states: 200x200px
- Celebrations: 240x240px

**Tablet/Responsive**:
- Empty states: 320x320px
- Onboarding: 360x360px
- Error states: 240x240px
- Celebrations: 300x300px

**Export**:
- Format: SVG with viewBox for scaling
- Optimize: Remove unnecessary metadata
- Compression: Minify SVG code

---

## Empty State Illustrations

### 1. No Bills Yet

**Context**: Dashboard screen when user has created no expenses
**User Flow**: Shown on first app launch after onboarding, before any bills created
**Emotional Goal**: Welcoming, encouraging, not overwhelming or intimidating

**Visual Composition**:

```
        🌟
    ___________
   /           \
  |  ^     ^   |   (Friendly character)
  |    \_/     |   (Open arms, welcoming pose)
   \___________/
      |  |  |
     /   |   \     (Arms spread wide)

    💰  ⊕  👥     (Subtle icons: money, plus, people)
```

**Key Elements**:
- **Central character**: Simple line-art person with friendly expression
  - Round head with dot eyes and curved smile
  - Arms open in welcoming gesture
  - Body: simple curved lines suggesting relaxed pose

- **Supporting icons** (very subtle, 30% opacity):
  - Small bill/receipt icon at bottom left
  - Plus symbol in center bottom
  - Small people/friends icon at bottom right

- **Background**:
  - Gentle circular gradient shape in Olive 100 (#EEF0E9)
  - Optional: Small decorative dots in Terracotta 100 (#F9E5DC)

**Color Mapping**:
- Character outline: Terracotta 700 (#9A4C32)
- Character fill: Terracotta 200 (#F4C9B4) on face/hands only
- Background circle: Olive 100 (#EEF0E9)
- Supporting icons: Neutral 500 (#8E7F70) at 30% opacity

**Dimensions**:
- Container: 240x240px (mobile), 320x320px (tablet)
- Character: ~60% of container height
- Supporting icons: 24x24px each

**Accessibility**:
- Alt text: "Welcome to Vasooly! A friendly illustration showing a welcoming figure ready to help you track shared expenses"
- Ensure 3:1 contrast ratio for decorative elements

**Text Pairing** (from wireframe specs):
> "No expenses yet! Tap + to add your first one"

---

### 2. No Friends Yet

**Context**: Friends list screen when user has not added any friends
**User Flow**: Shown in Friends tab before any friends added
**Emotional Goal**: Social, inviting, community-focused, not lonely

**Visual Composition**:

```
    👤  ➕  👤
     \  |  /
      \ | /
       \|/
        ⭘         (Connection point)
       /|\
      / | \
     /  |  \
    👤  ➕  👤
```

**Key Elements**:
- **Center element**: Circular node/hub (connection point)
  - Represents the user as central connection
  - Glowing effect with Terracotta gradient

- **Radiating connections**: 4-6 dashed lines extending outward
  - Lines end with placeholder friend circles (dotted outlines)
  - Suggests potential connections waiting to be made

- **Plus symbols**: Small plus icons on some connection points
  - Indicates "add friend" action
  - Positioned at 2-3 endpoints

**Color Mapping**:
- Central hub: Terracotta 500 (#CB6843) fill
- Connection lines: Terracotta 600 (#B85A3B) dashed strokes
- Placeholder circles: Neutral 300 (#D0C8BF) dotted strokes
- Plus symbols: Olive 500 (#6B7C4A)

**Dimensions**:
- Container: 240x240px (mobile), 320x320px (tablet)
- Central hub: 48px diameter
- Connection lines: 80-100px length
- Placeholder circles: 32px diameter
- Plus symbols: 20x20px

**Accessibility**:
- Alt text: "Network illustration showing connection opportunities, inviting you to add friends to split expenses"

**Text Pairing** (from wireframe specs):
> "No friends added. Add friends to start splitting expenses together"

---

### 3. No Activity

**Context**: Activity feed screen when all expenses are settled or no activity exists
**User Flow**: Shown when user has no pending actions or recent activity
**Emotional Goal**: Zen, calm, peaceful, "all caught up" satisfaction

**Visual Composition**:

```
      ☀️
     ~~~~
    ~~~~~~
   ~~~~~~~~      (Peaceful landscape)
  __________
   \      /
    \    /       (Gentle hills)
     \__/
```

**Key Elements**:
- **Landscape scene**: Minimalist horizon with gentle hills
  - 2-3 rounded hill shapes
  - Simple line work, very clean

- **Sun/glow element**: Small circle above hills
  - Subtle rays or glow effect
  - Represents clarity and peace

- **Optional decorative**: 1-2 small clouds (simple curved lines)
  - Very minimal, maintaining zen aesthetic

**Color Mapping**:
- Hills outline: Terracotta 700 (#9A4C32)
- Hills fill: Olive 100 (#EEF0E9)
- Sun: Terracotta 300 (#EEAC8C) with subtle glow
- Sky area: Neutral 50 (#FAF9F7)
- Clouds: Neutral 300 (#D0C8BF) very light

**Dimensions**:
- Container: 240x240px (mobile), 320x320px (tablet)
- Landscape: 200px wide × 140px tall
- Sun: 32px diameter

**Accessibility**:
- Alt text: "Peaceful landscape illustration representing a calm, settled state with no pending activity"

**Text Pairing** (from wireframe specs):
> "All caught up! No pending expenses or activity"

---

### 4. Search No Results

**Context**: Search screen when query returns no matching bills or friends
**User Flow**: Shown after user enters search query with zero results
**Emotional Goal**: Helpful, not frustrating; guide user to refine search

**Visual Composition**:

```
     ___
    /   \
   | 🔍 |        (Magnifying glass)
    \___/
      |
      |
     / \

   ❌ ❌ ❌      (No matches - subtle)
```

**Key Elements**:
- **Magnifying glass**: Central search icon
  - Large circular lens
  - Handle extending downward
  - Clean, simple line work

- **Empty/searching indicator**: Dotted circle inside lens
  - Represents "looking but nothing found"
  - Not solid, suggesting emptiness

- **Subtle "no match" symbols**: Small X marks or empty boxes
  - Very light, not harsh or error-like
  - Positioned below magnifying glass
  - 3-4 elements in a row

**Color Mapping**:
- Magnifying glass outline: Terracotta 700 (#9A4C32)
- Magnifying glass lens: Neutral 200 (#E8E4DF) subtle fill
- Dotted circle: Neutral 400 (#B3A79A) dashed stroke
- No-match symbols: Neutral 500 (#8E7F70) at 40% opacity

**Dimensions**:
- Container: 240x240px (mobile), 320x320px (tablet)
- Magnifying glass lens: 100px diameter
- Handle: 80px length
- No-match symbols: 16x16px each

**Accessibility**:
- Alt text: "Magnifying glass illustration representing search with no results found"

**Text Pairing** (from wireframe specs):
> "No matches found. Try different keywords or filters"

---

### 5. Offline State

**Context**: App-wide when device has no internet connection
**User Flow**: Shown when network unavailable and user attempts network action
**Emotional Goal**: Informative, temporary, reassuring (not an error)

**Visual Composition**:

```
      ☁️
     ~~~        (Cloud)
    ~~~~~

    ╱ ╲        (Disconnected signal)
   ╱   ╲
  ╱  ❌  ╲     (No connection)
 ╱_______╲
```

**Key Elements**:
- **Cloud shape**: Rounded cloud representing network/internet
  - Simple, friendly cloud form
  - 3-4 rounded bumps on top

- **Disconnected signal**: Broken wave/wifi symbol below cloud
  - 2-3 arc lines with gaps
  - Indicates disrupted connection

- **Device element** (optional): Simple phone outline at bottom
  - Very minimal, just suggests the device
  - Shows disconnect between device and cloud

**Color Mapping**:
- Cloud outline: Neutral 600 (#6F5F51)
- Cloud fill: Neutral 100 (#F5F3F0)
- Signal arcs: Terracotta 600 (#B85A3B) with gaps
- Disconnect symbol: Neutral 500 (#8E7F70)
- Device (if included): Neutral 400 (#B3A79A) outline only

**Dimensions**:
- Container: 200x200px (mobile), 240x240px (tablet)
- Cloud: 120px wide × 80px tall
- Signal arcs: 80px wide
- Device: 60px tall × 40px wide (if included)

**Accessibility**:
- Alt text: "Cloud with disconnected signal illustration indicating offline or no internet connection"

**Text Pairing**:
> "You're offline. Some features may be limited until you reconnect"

---

## Onboarding Illustrations

### 1. Welcome / Intro

**Context**: First onboarding screen after app launch
**User Flow**: Screen 1 of 4-6 onboarding sequence
**Emotional Goal**: Warm welcome, friendly introduction, trust-building

**Visual Composition**:

```
     ✨ 👋 ✨

   ___________
  /  VASOOLY  \    (App brand representation)
 |             |
 |   ^     ^   |   (Friendly mascot/character)
 |     \_/     |
  \___________/
      |   |
     / \ / \        (Welcoming stance)
```

**Key Elements**:
- **Friendly character/mascot**: Simple figure waving hello
  - Round, approachable design
  - One arm raised in wave gesture
  - Smiling expression

- **Brand element**: "Vasooly" text or logo representation
  - Can be simplified wordmark
  - Integrated with character (character holds sign, or text above)

- **Welcoming details**: Small sparkles or stars around character
  - Suggests excitement and positive energy
  - 3-4 small decorative elements

**Color Mapping**:
- Character outline: Terracotta 700 (#9A4C32)
- Character fill: Terracotta 200 (#F4C9B4)
- Brand/text: Terracotta 500 (#CB6843)
- Sparkles: Olive 500 (#6B7C4A)
- Background shapes: Neutral 100 (#F5F3F0)

**Dimensions**:
- Container: 280x280px (mobile), 360x360px (tablet)
- Character: 180px tall
- Sparkles: 16x16px each

**Accessibility**:
- Alt text: "Welcome to Vasooly! Friendly character waving hello, introducing the app"

**Text Pairing**:
> "Welcome to Vasooly"
> "Split bills fairly, settle up easily"

---

### 2. Bill Splitting Concept

**Context**: Onboarding screen explaining core value proposition
**User Flow**: Screen 2 of onboarding sequence
**Emotional Goal**: Clarity, simplicity, "this is easy" feeling

**Visual Composition**:

```
   💵  →  ✂️  →  👥

   [Bill]  [Split]  [Friends]

    $100  ÷  4  =  $25
```

**Key Elements**:
- **Bill representation**: Simple receipt or bill icon (left side)
  - Rectangular shape with lines suggesting text
  - Subtle dollar sign or amount visible

- **Division/split action**: Scissors or division symbol (center)
  - Shows the "splitting" action visually
  - Arrows pointing from bill to people

- **People/friends**: 3-4 simple figure outlines (right side)
  - Arranged in a group
  - Equal-sized to show fair division

- **Flow arrows**: Gentle arrows showing left-to-right progression
  - Bill → Split → Distributed

**Color Mapping**:
- Bill: Terracotta 600 (#B85A3B) outline, Terracotta 100 (#F9E5DC) fill
- Division symbol: Terracotta 500 (#CB6843)
- People figures: Olive 600 (#5A6A3F) outlines
- Arrows: Neutral 500 (#8E7F70)
- Amount text: Terracotta 700 (#9A4C32)

**Dimensions**:
- Container: 280x280px (mobile), 360x360px (tablet)
- Bill: 80px wide × 100px tall
- People figures: 50px tall each
- Arrows: 40px length

**Accessibility**:
- Alt text: "Illustration showing a bill being split fairly among a group of friends"

**Text Pairing**:
> "Split any expense"
> "Meals, trips, rent, or utilities - divide costs fairly"

---

### 3. Friend Groups Concept

**Context**: Onboarding screen explaining friend/group management
**User Flow**: Screen 3 of onboarding sequence
**Emotional Goal**: Social, connected, community feeling

**Visual Composition**:

```
      [Trip Group]
     👤 👤 👤 👤

    [Roommates]     [Dinner]
     👤 👤 👤         👤 👤
```

**Key Elements**:
- **Multiple groups**: 2-3 distinct friend circles
  - Each circle has different number of people (2-4)
  - Labeled or color-coded to show separation

- **Group containers**: Rounded rectangles or circles containing each group
  - Subtle backgrounds to show grouping
  - Labels like "Roommates", "Trip Crew", "Dinner Group"

- **Connection to user**: Central "you" figure with lines to groups
  - Shows user can be in multiple groups
  - Lines connect user to each group

**Color Mapping**:
- Group containers: Alternating Olive 100 (#EEF0E9) and Neutral 100 (#F5F3F0)
- People figures: Terracotta 700 (#9A4C32) outlines
- Group labels: Terracotta 600 (#B85A3B)
- Connection lines: Neutral 400 (#B3A79A)
- User figure (center): Terracotta 500 (#CB6843) fill

**Dimensions**:
- Container: 280x280px (mobile), 360x360px (tablet)
- Group containers: 100-120px wide each
- People figures: 32px tall
- Labels: 12px font size equivalent

**Accessibility**:
- Alt text: "Illustration showing a person connected to multiple friend groups for different activities"

**Text Pairing**:
> "Organize by groups"
> "Create groups for roommates, trips, or regular hangouts"

---

### 4. Settlement Tracking Concept

**Context**: Onboarding screen explaining settlement and balance tracking
**User Flow**: Screen 4 of onboarding sequence
**Emotional Goal**: Transparency, fairness, trust in the system

**Visual Composition**:

```
   You     Friend
   👤  ←→   👤
    \      /
     \    /
      $25         (Balance shown)
     /    \
    ✓      ✓     (Checkmarks when settled)
```

**Key Elements**:
- **Two figures**: Representing user and friend
  - Facing each other or side by side
  - Equal positioning (fairness)

- **Balance indicator**: Visual representation of money owed/owing
  - Could be coins, bills, or number display
  - Arrow showing direction (who owes whom)

- **Settlement checkmark**: Large checkmark when settled
  - Appears after settlement animation
  - Positive, successful feeling

- **Progress element** (optional): Bar showing settlement progress
  - Fills from 0% to 100%
  - Color transitions from pending to positive

**Color Mapping**:
- Figures: Terracotta 700 (#9A4C32) outlines
- Balance amount: Terracotta 500 (#CB6843)
- Direction arrow: Neutral 600 (#6F5F51)
- Settlement checkmark: Olive 500 (#6B7C4A)
- Progress bar: Terracotta 500 → Olive 500 (gradient)

**Dimensions**:
- Container: 280x280px (mobile), 360x360px (tablet)
- Figures: 80px tall each
- Balance indicator: 60px diameter
- Checkmark: 48px
- Progress bar: 180px wide × 8px tall

**Accessibility**:
- Alt text: "Illustration showing two people with a balance indicator and settlement checkmark, representing tracking and settling debts"

**Text Pairing**:
> "Track balances easily"
> "See who owes what, settle up with a tap"

---

### 5. Privacy & Security

**Context**: Onboarding screen reassuring about data privacy
**User Flow**: Screen 5 of onboarding sequence
**Emotional Goal**: Trust, security, peace of mind

**Visual Composition**:

```
      🔒
     ____
    |    |        (Shield with lock)
    |    |
    |____|
   /      \
  /   ✓    \      (Verified/protected)
 /__________\
```

**Key Elements**:
- **Shield icon**: Classic shield shape representing protection
  - Centered, prominent
  - Simple outline, not overly detailed

- **Lock or checkmark**: Symbol inside shield
  - Lock represents security
  - Checkmark represents verified protection

- **Data elements** (optional): Small document/data icons around shield
  - Subtle indication of what's being protected
  - 3-4 small icons (receipt, user profile, etc.)

- **Secure glow**: Subtle glow or gradient behind shield
  - Suggests active protection

**Color Mapping**:
- Shield outline: Terracotta 700 (#9A4C32)
- Shield fill: Olive 100 (#EEF0E9)
- Lock/checkmark: Olive 600 (#5A6A3F)
- Glow effect: Terracotta 200 (#F4C9B4) gradient
- Data icons: Neutral 500 (#8E7F70) at 50% opacity

**Dimensions**:
- Container: 280x280px (mobile), 360x360px (tablet)
- Shield: 160px tall × 140px wide
- Lock/checkmark: 48px
- Data icons: 24x24px each

**Accessibility**:
- Alt text: "Shield with lock illustration representing data privacy and security protection"

**Text Pairing**:
> "Your data is private"
> "End-to-end encryption keeps your expenses secure"

---

### 6. Ready to Start

**Context**: Final onboarding screen before entering app
**User Flow**: Screen 6 of onboarding sequence (final screen)
**Emotional Goal**: Excitement, readiness, confidence to begin

**Visual Composition**:

```
      ✨
     🎯 ✨        (Target/goal)
   ✨  |  ✨
      👤          (User ready to start)
     /|\
    / | \
     / \
   _______       (Starting line/path ahead)
```

**Key Elements**:
- **Character in ready pose**: Figure in confident, ready stance
  - Arms slightly raised or at sides
  - Forward-leaning pose suggesting motion

- **Target/goal symbol**: Above or ahead of character
  - Represents the journey ahead
  - Simple target or flag icon

- **Starting line or path**: Visual cue of beginning journey
  - Simple line or path extending forward
  - Can be dotted line suggesting steps ahead

- **Sparkles/stars**: Celebratory elements around character
  - Excitement and positive energy
  - 4-6 small decorative sparkles

**Color Mapping**:
- Character: Terracotta 700 (#9A4C32) outline, Terracotta 200 (#F4C9B4) fill
- Target/goal: Olive 500 (#6B7C4A)
- Path: Neutral 400 (#B3A79A) dashed line
- Sparkles: Terracotta 400 (#DC8563) and Olive 400 (#A3AF92)
- Background: Subtle Neutral 100 (#F5F3F0) shapes

**Dimensions**:
- Container: 280x280px (mobile), 360x360px (tablet)
- Character: 140px tall
- Target: 48px diameter
- Path: 200px length
- Sparkles: 12-16px each

**Accessibility**:
- Alt text: "Person in ready stance with sparkles and a goal ahead, representing readiness to begin using the app"

**Text Pairing**:
> "You're all set!"
> "Start splitting expenses with friends"

---

## Error State Illustrations

### 1. General Error

**Context**: Generic error when something unexpected happens
**User Flow**: Shown when app encounters unspecified error
**Emotional Goal**: Apologetic but not alarming, reassuring recovery is possible

**Visual Composition**:

```
     ????
    /    \
   | !  ! |       (Confused/surprised)
   |  __  |
    \____/
      ||
     /  \

   [Oops!]        (Gentle error message)
```

**Key Elements**:
- **Character with mild confusion**: Simple figure with questioning pose
  - Hands to head or sides in "oops" gesture
  - Expression: concerned but not distressed (circular eyes, wavy mouth)

- **Question marks or exclamation**: Light symbols above character
  - Not harsh, more "hmm?" than "ERROR!"
  - 1-2 symbols maximum

- **Tool/wrench icon** (optional): Suggesting "we're fixing it"
  - Small, positioned near character
  - Not prominent, just subtle reassurance

**Color Mapping**:
- Character outline: Terracotta 700 (#9A4C32)
- Character fill: Terracotta 100 (#F9E5DC)
- Question marks: Terracotta 500 (#CB6843)
- Tool icon: Neutral 600 (#6F5F51)

**Dimensions**:
- Container: 200x200px (mobile), 240x240px (tablet)
- Character: 120px tall
- Question marks: 24px each

**Accessibility**:
- Alt text: "Confused character illustration representing an unexpected error occurred"

**Text Pairing**:
> "Oops! Something went wrong"
> "We're looking into it. Please try again"

---

### 2. Network Error

**Context**: Error when network request fails or times out
**User Flow**: Shown when API call fails or connection times out
**Emotional Goal**: Explain technical issue clearly, not user's fault

**Visual Composition**:

```
   Server        User
     🖥️    ❌    📱
      \         /
       \       /
        \  X  /        (Broken connection)
         \   /
          \ /
```

**Key Elements**:
- **Two endpoints**: Server and device/user
  - Server: Simple computer/server icon (left)
  - Device: Phone or tablet icon (right)

- **Broken connection**: Line between them with break/X
  - Jagged break in the middle
  - X mark at break point

- **Retry indicator** (optional): Circular arrow suggesting retry
  - Positioned below the connection
  - Shows action user can take

**Color Mapping**:
- Server icon: Neutral 600 (#6F5F51)
- Device icon: Terracotta 600 (#B85A3B)
- Connection line: Neutral 500 (#8E7F70)
- Break/X: Terracotta 500 (#CB6843)
- Retry arrow: Olive 500 (#6B7C4A)

**Dimensions**:
- Container: 200x200px (mobile), 240x240px (tablet)
- Server icon: 48px
- Device icon: 48px
- Connection line: 80px length
- Retry arrow: 32px diameter

**Accessibility**:
- Alt text: "Server and device with broken connection illustration representing network error"

**Text Pairing**:
> "Connection lost"
> "Check your internet connection and try again"

---

### 3. Permission Denied

**Context**: Error when user denies required permission (camera, contacts, etc.)
**User Flow**: Shown after permission request denied
**Emotional Goal**: Explain why permission needed, how to grant it

**Visual Composition**:

```
     ___
    |   |
    | 🚫 |        (Blocked/denied)
    |___|
      |
    [App]
     📱
```

**Key Elements**:
- **Permission symbol**: Hand in "stop" gesture or shield with slash
  - Clear indication of blocking/denial
  - Not angry, just neutral barrier

- **App icon or name**: Below permission symbol
  - Shows what's requesting permission
  - Small app representation

- **Settings gear** (optional): Suggesting where to grant permission
  - Small gear icon
  - Indicates user can fix in settings

**Color Mapping**:
- Stop hand/shield: Terracotta 600 (#B85A3B)
- Slash mark: Terracotta 500 (#CB6843)
- App icon: Neutral 600 (#6F5F51)
- Settings gear: Olive 500 (#6B7C4A)

**Dimensions**:
- Container: 200x200px (mobile), 240x240px (tablet)
- Permission symbol: 80px
- App icon: 40px
- Settings gear: 32px

**Accessibility**:
- Alt text: "Blocked permission illustration showing access denied to app feature"

**Text Pairing**:
> "Permission required"
> "Please enable [permission] in Settings to use this feature"

---

### 4. Payment Failed

**Context**: Error when settlement payment fails to process
**User Flow**: Shown after failed payment attempt
**Emotional Goal**: Not alarming, guide to resolution

**Visual Composition**:

```
     💳
    /   \
   |  ❌  |       (Failed card)
    \___/
      ||
    [Try Again]
```

**Key Elements**:
- **Payment card**: Credit card or payment icon
  - Rectangular card shape
  - X mark or decline symbol on card

- **Failure indicator**: Red X or decline symbol
  - Clear but not harsh
  - Centered on card

- **Retry or alternative**: Arrow suggesting retry or different method
  - Curved arrow for retry
  - Or multiple payment options shown

**Color Mapping**:
- Card outline: Neutral 600 (#6F5F51)
- Card surface: Neutral 100 (#F5F3F0)
- X mark: Terracotta 500 (#CB6843)
- Retry arrow: Olive 500 (#6B7C4A)

**Dimensions**:
- Container: 200x200px (mobile), 240x240px (tablet)
- Card: 120px wide × 80px tall
- X mark: 40px
- Retry arrow: 36px

**Accessibility**:
- Alt text: "Credit card with decline mark illustration representing failed payment"

**Text Pairing**:
> "Payment failed"
> "Please check your payment method and try again"

---

## Celebration Illustrations

### 1. First Bill Created

**Context**: Success modal after user creates their very first bill
**User Flow**: Shown immediately after first bill saved successfully
**Emotional Goal**: Excitement, accomplishment, encouragement to continue

**Visual Composition**:

```
      ⭐
    ✨ 🎉 ✨

     📝 ✓        (Bill with checkmark)
    /   \
   |     |
   |_____|

    [Success!]
```

**Key Elements**:
- **Bill with checkmark**: Simple receipt/bill icon with large checkmark
  - Bill: rectangular with lines suggesting text
  - Checkmark: Overlaying or next to bill, prominent

- **Celebration elements**: Stars, sparkles, confetti
  - 6-8 decorative elements around bill
  - Various sizes for depth
  - Radiating outward pattern

- **Character celebrating** (optional): Small figure with arms raised
  - Positioned below or beside bill
  - Excited pose

**Color Mapping**:
- Bill: Terracotta 200 (#F4C9B4) fill, Terracotta 700 (#9A4C32) outline
- Checkmark: Olive 500 (#6B7C4A)
- Stars/sparkles: Terracotta 400 (#DC8563) and Olive 400 (#A3AF92)
- Confetti: Mix of Terracotta 300 (#EEAC8C) and Olive 300 (#C5CDBA)
- Character (if included): Terracotta 700 (#9A4C32)

**Dimensions**:
- Container: 240x240px (mobile), 300x300px (tablet)
- Bill: 100px tall × 80px wide
- Checkmark: 60px
- Stars: 16-24px varying sizes
- Character: 60px tall (if included)

**Accessibility**:
- Alt text: "Celebration illustration with bill and checkmark surrounded by stars and sparkles, representing first successful bill creation"

**Text Pairing**:
> "First bill created! 🎉"
> "You're on your way to fair expense splitting"

---

### 2. All Bills Settled

**Context**: Success modal when all outstanding bills are settled
**User Flow**: Shown after settling final outstanding balance
**Emotional Goal**: Major accomplishment, relief, satisfaction

**Visual Composition**:

```
      ✨ 🌟 ✨
     ___________
    |  SETTLED  |
    |     ✓     |   (Big success badge)
    |___________|
         ||
    ___________
   | Balance:  |
   |    $0     |   (Zero balance)
   |___________|
```

**Key Elements**:
- **Zero balance display**: Large "0" or "$0" with checkmark
  - Clean, satisfying visual
  - Can be in a badge or shield shape

- **Settled badge**: "All Settled" or checkmark in badge
  - Premium, achievement feel
  - Ribbon or medal styling optional

- **Celebration burst**: Confetti, rays, or particle effects
  - Energetic, celebratory
  - Radiating from center outward
  - More elaborate than first bill celebration

**Color Mapping**:
- Badge: Olive 100 (#EEF0E9) background, Olive 600 (#5A6A3F) border
- Checkmark: Olive 500 (#6B7C4A)
- Zero balance: Olive 600 (#5A6A3F)
- Celebration rays: Terracotta 300 (#EEAC8C) gradient
- Confetti: Terracotta 400 (#DC8563), Olive 400 (#A3AF92), Neutral 300 (#D0C8BF)

**Dimensions**:
- Container: 240x240px (mobile), 300x300px (tablet)
- Badge: 140px diameter
- Zero balance: 80px
- Confetti particles: 8-20px varying sizes
- Rays: 120px length from center

**Accessibility**:
- Alt text: "Celebration illustration with settled badge and zero balance surrounded by confetti and rays, representing all bills fully settled"

**Text Pairing**:
> "All settled! 🎊"
> "Every penny accounted for. You're all square!"

---

### 3. Friend Added

**Context**: Success toast/modal after adding a new friend
**User Flow**: Shown immediately after friend successfully added
**Emotional Goal**: Social connection, growing network, friendly

**Visual Composition**:

```
      +
   👤 → 👤        (Two figures connecting)
    \   /
     \ /
      ✓           (Connection confirmed)
```

**Key Elements**:
- **Two figures connecting**: User figure and new friend figure
  - Positioned facing each other or side by side
  - Visual connection line or handshake between them

- **Plus symbol**: Above or between figures
  - Indicates addition/new connection
  - Friendly, welcoming

- **Checkmark or heart** (optional): Below connection
  - Confirms successful addition
  - Heart suggests friendship (optional, not too casual)

- **Small celebration**: 2-3 sparkles or stars
  - Subtle, not overwhelming
  - Around the connection point

**Color Mapping**:
- Figures: Terracotta 700 (#9A4C32) outlines
- Plus symbol: Olive 500 (#6B7C4A)
- Connection line: Terracotta 500 (#CB6843)
- Checkmark: Olive 500 (#6B7C4A)
- Sparkles: Terracotta 400 (#DC8563)

**Dimensions**:
- Container: 240x240px (mobile), 300x300px (tablet)
- Figures: 60px tall each
- Plus symbol: 32px
- Connection line: 40px
- Checkmark: 24px
- Sparkles: 12px each

**Accessibility**:
- Alt text: "Two figures connecting with plus symbol and checkmark, representing new friend successfully added"

**Text Pairing**:
> "Friend added! 👥"
> "[Friend name] is now in your network"

---

### 4. Large Settlement Completed

**Context**: Success modal after settling a large balance (>$100 threshold)
**User Flow**: Shown after significant payment marked as settled
**Emotional Goal**: Major accomplishment, financial responsibility, relief

**Visual Composition**:

```
      💰
     ✨ ✨
    _______
   |  $$$  |      (Money settled)
   |   ↓   |
   |  [✓]  |      (Confirmed)
   |_______|

     🤝           (Handshake)
```

**Key Elements**:
- **Large amount display**: Dollar signs or amount in prominent position
  - Can be in a coin/currency icon
  - Large, satisfying to see

- **Settlement arrow**: Down arrow showing debt cleared
  - From amount to checkmark
  - Clear directionality

- **Handshake or agreement symbol**: Mutual settlement acknowledged
  - Two hands shaking or two checkmarks
  - Represents both parties settled

- **Premium celebration**: Stars, glow, or premium badge elements
  - More elaborate than small settlements
  - Suggests significance of achievement

**Color Mapping**:
- Amount/currency: Terracotta 500 (#CB6843)
- Settlement arrow: Olive 500 (#6B7C4A)
- Checkmark: Olive 600 (#5A6A3F)
- Handshake: Terracotta 700 (#9A4C32)
- Glow effect: Terracotta 200 (#F4C9B4) gradient
- Stars: Olive 400 (#A3AF92) and Terracotta 400 (#DC8563)

**Dimensions**:
- Container: 240x240px (mobile), 300x300px (tablet)
- Amount display: 100px diameter
- Arrow: 40px length
- Checkmark: 48px
- Handshake: 60px wide
- Stars: 16-20px

**Accessibility**:
- Alt text: "Large settlement celebration with currency symbol, checkmark, and handshake, representing significant debt successfully settled"

**Text Pairing**:
> "Big settlement! 🎉"
> "$[amount] settled with [friend name]"

---

## Technical Specifications

### SVG Export Settings

**Optimization**:
- Remove XML declaration
- Remove comments and metadata
- Minify SVG code
- Inline styles (no external CSS)
- Round decimal values to 2 places

**viewBox Configuration**:
```svg
<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Content -->
</svg>
```

**Responsive Sizing**:
```svg
<!-- Mobile -->
<svg width="240" height="240" viewBox="0 0 240 240">

<!-- Tablet -->
<svg width="320" height="320" viewBox="0 0 240 240">
```

### Color Implementation

**Design Tokens Reference**:
```svg
<!-- Primary line color -->
<path stroke="#9A4C32" stroke-width="2.5" />

<!-- Fill colors -->
<rect fill="#F4C9B4" />
<circle fill="#EEF0E9" />

<!-- Opacity for subtle elements -->
<path stroke="#8E7F70" opacity="0.3" />
```

**Gradient Example** (for glows/celebrations):
```svg
<defs>
  <radialGradient id="terracottaGlow">
    <stop offset="0%" stop-color="#EEAC8C" stop-opacity="0.8" />
    <stop offset="100%" stop-color="#F4C9B4" stop-opacity="0" />
  </radialGradient>
</defs>
```

### Accessibility Requirements

**Alt Text Guidelines**:
- Describe what the illustration represents, not visual details
- Keep under 125 characters
- Include emotional context when relevant
- Match tone to illustration purpose

**ARIA Attributes**:
```svg
<svg role="img" aria-labelledby="emptyStateTitle">
  <title id="emptyStateTitle">No bills yet illustration</title>
  <desc>Welcoming figure with open arms encouraging first expense creation</desc>
  <!-- Content -->
</svg>
```

**Contrast Requirements**:
- Primary elements: 3:1 minimum contrast ratio
- Decorative elements: Contrast not required but recommended
- Text pairing must meet WCAG AA (4.5:1 for body text)

### Performance Optimization

**File Size Targets**:
- Simple illustrations: < 5KB
- Medium complexity: < 10KB
- Complex celebrations: < 15KB

**Optimization Techniques**:
- Use `<path>` over `<polygon>` for simpler markup
- Reuse elements with `<use>` for repeated shapes
- Combine paths where possible
- Remove unnecessary decimal precision

**Loading Strategy**:
- Inline SVG for critical illustrations (onboarding)
- Lazy load for non-critical states (error, offline)
- Cache aggressively (illustrations rarely change)

---

## Implementation Guidelines

### Component Integration

**React Native Implementation**:
```tsx
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

const EmptyStateBills = () => (
  <Svg width={240} height={240} viewBox="0 0 240 240">
    {/* Illustration paths */}
  </Svg>
);
```

**With Design Tokens**:
```tsx
import { tokens } from '@/theme/tokens';

<Path
  stroke={tokens.colors.brand.primary}
  strokeWidth={2.5}
  fill={tokens.colors.brand.primaryLight}
/>
```

### Animation Opportunities

**Entrance Animations**:
- FadeIn + ScaleIn for empty states (400ms)
- DrawSVG path animation for onboarding (800ms)
- SequentialReveal for multi-element illustrations (1200ms)

**Interactive States**:
- Pulse animation on celebration illustrations (continuous)
- Wiggle on error states when shown (once, 300ms)
- Subtle float animation on empty states (continuous, slow)

**Reanimated 3 Example**:
```tsx
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(1, { duration: 400 }),
  transform: [
    { scale: withSpring(1, tokens.animations.spring.gentle) }
  ],
}));
```

### File Naming Convention

**Pattern**: `illustration-[category]-[name].svg`

**Examples**:
- `illustration-empty-no-bills.svg`
- `illustration-onboarding-welcome.svg`
- `illustration-error-network.svg`
- `illustration-celebration-all-settled.svg`

### Directory Structure

```
src/assets/illustrations/
├── empty-states/
│   ├── no-bills.svg
│   ├── no-friends.svg
│   ├── no-activity.svg
│   ├── search-no-results.svg
│   └── offline.svg
├── onboarding/
│   ├── welcome.svg
│   ├── bill-splitting.svg
│   ├── friend-groups.svg
│   ├── settlement-tracking.svg
│   ├── privacy-security.svg
│   └── ready-to-start.svg
├── errors/
│   ├── general-error.svg
│   ├── network-error.svg
│   ├── permission-denied.svg
│   └── payment-failed.svg
└── celebrations/
    ├── first-bill.svg
    ├── all-settled.svg
    ├── friend-added.svg
    └── large-settlement.svg
```

### Design Handoff

**For Designers Creating SVGs**:
1. Use earthen color palette tokens exactly as specified
2. Maintain stroke weights at 2-2.5px
3. Use rounded line caps and joins throughout
4. Export with viewBox, not fixed width/height
5. Test at both mobile (240px) and tablet (320px) sizes
6. Verify accessibility contrast ratios
7. Provide both optimized and source files

**For Developers Implementing**:
1. Use react-native-svg for all illustrations
2. Reference design tokens, never hardcode colors
3. Implement entrance animations for empty states and celebrations
4. Add proper ARIA labels and alt text
5. Test on multiple screen sizes
6. Lazy load non-critical illustrations
7. Monitor bundle size impact

---

## Week 12-16 Implementation Roadmap

### Week 12: Core Screens
**Illustrations Needed**:
- Onboarding: All 6 illustrations (welcome through ready-to-start)
- Empty state: No bills yet (Dashboard)
- Celebration: First bill created

**Priority**: HIGH - Required for initial user experience

---

### Week 13: Tier 2 Screens
**Illustrations Needed**:
- Empty state: No friends yet (Friends list)
- Empty state: No activity (Activity feed)
- Celebration: Friend added

**Priority**: MEDIUM - Needed for complete feature set

---

### Week 14: Premium Features
**Illustrations Needed**:
- Celebration: All bills settled
- Celebration: Large settlement completed

**Priority**: MEDIUM - Enhances satisfaction of completing actions

---

### Week 15: Polish & Edge Cases
**Illustrations Needed**:
- Empty state: Search no results
- Empty state: Offline state
- Error states: All 4 (general, network, permission, payment)

**Priority**: LOW-MEDIUM - Edge cases and error handling

---

### Week 16: Testing & Refinement
**Tasks**:
- Test all illustrations on various screen sizes
- Verify accessibility compliance
- Optimize file sizes
- Implement animations
- Final polish on colors and alignment

**Priority**: FINAL VALIDATION

---

## Appendix: Illustration Checklist

### Day 4 Completion Criteria

**Illustration System**: ✅
- [x] Style guide defined (line art, minimal color, friendly)
- [x] Color palette mapped to earthen design tokens
- [x] Technical specifications documented (SVG, sizing, strokes)

**Empty States**: ✅
- [x] No bills yet - Specified
- [x] No friends yet - Specified
- [x] No activity - Specified
- [x] Search no results - Specified
- [x] Offline state - Specified

**Onboarding Flow**: ✅
- [x] Welcome/Intro - Specified
- [x] Bill splitting concept - Specified
- [x] Friend groups concept - Specified
- [x] Settlement tracking - Specified
- [x] Privacy & security - Specified
- [x] Ready to start - Specified

**Error States**: ✅
- [x] General error - Specified
- [x] Network error - Specified
- [x] Permission denied - Specified
- [x] Payment failed - Specified

**Celebration States**: ✅
- [x] First bill created - Specified
- [x] All bills settled - Specified
- [x] Friend added - Specified
- [x] Large settlement - Specified

---

**Status**: ✅ Complete
**Version**: 1.0
**Next Steps**: Proceed to Day 5 Component Library Audit
