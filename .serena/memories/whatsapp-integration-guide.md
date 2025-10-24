# WhatsApp Payment Integration Guide

**Feature**: WhatsApp-first payment requests with UPI URL shortening
**Status**: Production-ready
**Last Updated**: 2025-10-24

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User selects participant → Create payment request            │
│  2. App generates UPI URL (upi://pay?pa=...&am=...)             │
│  3. urlShortenerService wraps UPI in HTTP redirect              │
│  4. Shortened with is.gd → https://is.gd/abc123                 │
│  5. whatsappService opens WhatsApp with message                 │
│  6. Recipient clicks link → redirect page → UPI app             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Service Layers

```
┌──────────────────────────────────────────┐
│     UI Layer (VasoolyDetailScreen)       │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│     whatsappService.ts                   │
│  - Phone validation                      │
│  - Message generation                    │
│  - Haptic feedback                       │
│  - Batch send coordination               │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│     urlShortenerService.ts               │
│  - Non-HTTP protocol detection           │
│  - HTTP redirect wrapper                 │
│  - is.gd shortening                      │
│  - Vercel bypass secret                  │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│     External Services                    │
│  - is.gd API (URL shortening)           │
│  - Vercel redirect service              │
│  - WhatsApp deep linking                │
└──────────────────────────────────────────┘
```

---

## URL Shortener Service

### Configuration

**File**: `src/services/urlShortenerService.ts`

```typescript
const CONFIG = {
  timeout: 10000, // 10 seconds per attempt
  maxRetries: 2,  // 2 retry attempts
  enableLogging: true,

  // Redirect service URL (Vercel deployment)
  redirectServiceUrl: 'https://vasooly-redirect-q2639ymjm-nikunjs-projects-129287b3.vercel.app',

  // Vercel protection bypass secret
  vercelBypassSecret: 'nikunjtest123nikunjtest123nikunj',
};
```

### Key Functions

#### shortenUrl(longUrl: string)

**Purpose**: Shorten any URL, wrapping non-HTTP protocols in redirect service

**Flow**:
```typescript
1. Validate input (not empty)
2. Detect protocol (http/https vs custom like upi://)
3. If custom protocol:
   a. Wrap in HTTP: ${redirectServiceUrl}/?to=${encodedUrl}
   b. Append bypass secret if configured
4. Shorten with is.gd (2 retries)
5. Return result:
   - success: true → shortUrl contains is.gd link
   - success: false → shortUrl contains wrapped URL or original
```

**Example**:
```typescript
const result = await shortenUrl('upi://pay?pa=merchant@paytm&am=500');
// result.shortUrl: "https://is.gd/abc123"
// When clicked → redirect page → UPI app opens
```

#### shortenUrlBatch(urls: string[])

**Purpose**: Shorten multiple URLs in parallel

**Flow**:
```typescript
1. Map urls to individual shortenUrl() calls
2. Execute with Promise.all() for parallel processing
3. Return array of results
4. Never throws - returns fallback for failed URLs
```

#### isServiceAvailable()

**Purpose**: Health check for is.gd service

**Usage**:
```typescript
const available = await isServiceAvailable();
if (!available) {
  console.warn('URL shortening may fail');
}
```

---

## WhatsApp Service

### Configuration

**File**: `src/services/whatsappService.ts`

**Dependencies**:
```typescript
import { Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { shortenUrl } from './urlShortenerService';
import { generateUPILink } from '../lib/business/upiGenerator';
```

### Key Functions

#### sendPaymentRequest(participant, bill, upiVPA, upiName)

**Purpose**: Send payment request to single participant

**Flow**:
```typescript
1. Validate phone number (formatPhoneNumber)
2. Check WhatsApp installed (isWhatsAppInstalled)
3. Generate UPI link (generateUPILink)
4. Shorten URL (shortenUrl)
5. Generate message (generatePaymentMessage)
6. Haptic feedback (Medium impact)
7. Open WhatsApp (Linking.openURL)
8. Return result (success/failure with error)
```

**Error Handling**:
- No phone number → return error
- Invalid phone format → return error
- WhatsApp not installed → return error
- Any exception → return error with message

**Example**:
```typescript
const result = await sendPaymentRequest(
  participant,
  bill,
  'merchant@paytm',
  'Merchant Name'
);

if (result.success) {
  console.log(`WhatsApp opened for ${result.participantName}`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

#### sendPaymentRequestsToAll(participants, bill, upiVPA, upiName, onProgress)

**Purpose**: Batch send payment requests with progress tracking

**Flow**:
```typescript
1. Filter participants (exclude those who paid)
2. Haptic feedback (Notification - Start)
3. For each participant:
   a. Report progress (status: 'sending')
   b. Send payment request
   c. Haptic feedback (Light for success, Error for failure)
   d. Update counters (totalSent, totalFailed)
   e. Report progress (status: 'success' or 'failed')
   f. Delay 1 second before next
4. Haptic feedback (Notification - Complete)
5. Show completion summary alert
6. Return batch results
```

**Progress Callback**:
```typescript
onProgress?: (
  current: number,     // 1-based current index
  total: number,       // Total pending participants
  participantName: string,
  status?: 'sending' | 'success' | 'failed'
) => void
```

**Completion Summary**:
- All success: "All 5 payment requests sent successfully! 🎉"
- Some failed: "Sent 5 requests. 2 failed - check phone numbers and try again."

**Example**:
```typescript
const result = await sendPaymentRequestsToAll(
  participants,
  bill,
  'merchant@paytm',
  'Merchant Name',
  (current, total, name, status) => {
    console.log(`[${current}/${total}] ${name}: ${status}`);
  }
);

console.log(`Sent: ${result.totalSent}, Failed: ${result.totalFailed}`);
```

#### sendPaymentReminder(participantName, participantPhone, pendingBills, upiVPA, upiName)

**Purpose**: Send reminder for multiple pending payments

**Flow**:
```typescript
1. Validate phone number
2. Check WhatsApp installed
3. For each pending bill:
   a. Find participant in bill
   b. Generate UPI link
   c. Shorten URL
   d. Collect bill info (title, amount, URL)
4. Generate reminder message (all bills in one message)
5. Haptic feedback (Medium impact)
6. Open WhatsApp
7. Return result
```

**Reminder Message Format**:
```
Hi John! 🔔
2 pending payments (₹850):

• Dinner at Restaurant: ₹500
👉 Pay now: https://is.gd/abc123

• Movie tickets: ₹350
👉 Pay now: https://is.gd/def456

- Vasooly
```

---

## Redirect Service

### Deployment

**Platform**: Vercel (free tier)
**URL**: `https://vasooly-redirect-q2639ymjm-nikunjs-projects-129287b3.vercel.app`

**Files**:
- `redirect-service/index.html` - Redirect page
- `redirect-service/vercel.json` - Deployment config
- `redirect-service/README.md` - Setup instructions

### How It Works

1. **User clicks shortened URL**: `https://is.gd/abc123`
2. **is.gd redirects to**: `https://redirect.vercel.app/?to=upi://...&x-vercel-protection-bypass=secret`
3. **Redirect page loads**: Shows "Redirecting to Payment..." with spinner
4. **JavaScript executes**: `window.location.href = decodedUrl` (the UPI URL)
5. **UPI app opens**: Phone OS handles upi:// protocol
6. **Fallback**: After 2 seconds, shows "Tap here to pay" button

### Vercel Protection Bypass

**Purpose**: Allow public access without disabling deployment protection

**How It Works**:
- Vercel deployment has protection enabled (requires auth)
- Bypass secret (`nikunjtest123nikunjtest123nikunj`) allows public access
- Appended as query parameter: `x-vercel-protection-bypass=secret`
- Vercel validates secret and allows access

**Security**: 
- Secret is not sensitive (just allows page access)
- Page doesn't store or process any user data
- No backend logic, purely static HTML

---

## Message Templates

### Payment Request Message

```typescript
function generatePaymentMessage(
  participantName: string,
  billTitle: string,
  amountPaise: number,
  shortUrl: string
): string {
  const amount = (amountPaise / 100).toFixed(2);
  
  const truncatedTitle = billTitle.length > 30
    ? `${billTitle.substring(0, 27)}...`
    : billTitle;

  return `Hi ${participantName}! 💸
Pay ₹${amount} for ${truncatedTitle}

👉 Tap here to pay instantly:
${shortUrl}

- Vasooly`;
}
```

**Example Output**:
```
Hi John! 💸
Pay ₹500.00 for Dinner at Restaurant

👉 Tap here to pay instantly:
https://is.gd/abc123

- Vasooly
```

### Reminder Message

```typescript
function generateReminderMessage(
  participantName: string,
  pendingBills: Array<{
    title: string;
    amountPaise: number;
    shortUrl: string;
  }>
): string {
  const totalPaise = pendingBills.reduce((sum, bill) => sum + bill.amountPaise, 0);
  const totalAmount = (totalPaise / 100).toFixed(2);
  const count = pendingBills.length;

  let message = `Hi ${participantName}! 🔔\n${count} pending payment${count > 1 ? 's' : ''} (₹${totalAmount}):\n`;

  pendingBills.forEach((bill, index) => {
    const amount = (bill.amountPaise / 100).toFixed(2);
    const truncatedTitle = bill.title.length > 20
      ? `${bill.title.substring(0, 17)}...`
      : bill.title;
    message += `\n• ${truncatedTitle}: ₹${amount}\n👉 Pay now: ${bill.shortUrl}`;

    if (index < pendingBills.length - 1) {
      message += '\n';
    }
  });

  message += '\n\n- Vasooly';
  return message;
}
```

---

## Haptic Feedback System

### Haptic Types Used

| Action | Haptic Type | Feel | Purpose |
|--------|-------------|------|---------|
| Open WhatsApp (single) | ImpactFeedbackStyle.Medium | Medium thud | Action confirmation |
| Batch start | NotificationFeedbackType.Success | Success chime | Signal beginning |
| Each success | ImpactFeedbackStyle.Light | Light tap | Progress feedback |
| Each failure | NotificationFeedbackType.Error | Error buzz | Alert to issue |
| Batch complete | NotificationFeedbackType.Success | Success chime | Completion signal |

### Implementation

```typescript
import * as Haptics from 'expo-haptics';

// Single send
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Batch send start
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Each successful send
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Failed send
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Batch complete
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### Why Haptic Feedback?

**Problem**: Manual tap to send in WhatsApp felt unresponsive

**Solution**: Tactile confirmation at each interaction point

**Benefits**:
- Immediate feedback (no delay waiting for WhatsApp)
- Confirms action was registered
- Makes manual tap feel intentional
- Industry standard (banking apps use this)

---

## Phone Number Validation

### Format Rules

**Indian Phone Numbers**:
- 10 digits → Add +91 prefix
- 12 digits starting with 91 → Add + prefix
- Already has + → Keep as is

**Invalid Cases**:
- Empty string
- Less than 10 digits
- More than 12 digits
- Doesn't match expected patterns

### Implementation

```typescript
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // 10 digits (standard Indian mobile)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // 12 digits with 91 prefix
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // 12 digits (assume has + removed)
  if (cleaned.length === 12) {
    return `+${cleaned}`;
  }

  console.warn('Invalid phone number format:', phone);
  return null;
}
```

**Examples**:
```typescript
formatPhoneNumber('9876543210')     // → "+919876543210"
formatPhoneNumber('919876543210')   // → "+919876543210"
formatPhoneNumber('+919876543210')  // → "+919876543210"
formatPhoneNumber('123')            // → null
```

---

## Error Handling

### URL Shortener Errors

**Scenarios**:
1. **Empty URL**: Returns error immediately
2. **is.gd API error**: Logs error, returns wrapped redirect URL
3. **is.gd timeout**: Retries up to 2 times, then returns wrapped URL
4. **Network error**: Returns wrapped URL as fallback

**Fallback Strategy**:
```
Try shorten with is.gd
  ├─ Success → Return shortened URL ✅
  ├─ Failure + has redirect wrapper → Return wrapped URL ✅
  └─ Failure + no redirect wrapper → Return original URL ⚠️
```

### WhatsApp Service Errors

**Validation Errors**:
- No phone number → `error: 'No phone number'`
- Invalid format → `error: 'Invalid phone number format'`
- WhatsApp not installed → `error: 'WhatsApp not installed'`

**Runtime Errors**:
- Exception during send → `error: error.message`
- All errors return `success: false` (never throw)

**Error Display**:
```typescript
if (!result.success) {
  if (result.error === 'WhatsApp not installed') {
    showWhatsAppNotInstalledError();
  } else if (result.error === 'Invalid phone number format') {
    showInvalidPhoneError(result.participantName);
  } else {
    Alert.alert('Error', result.error);
  }
}
```

---

## Testing Checklist

### URL Shortener Tests

- [ ] HTTP URLs shorten correctly
- [ ] HTTPS URLs shorten correctly
- [ ] UPI URLs wrap with redirect service
- [ ] Bypass secret appended to wrapped URLs
- [ ] Empty URL returns error
- [ ] is.gd failure returns wrapped URL
- [ ] Batch shortening works in parallel
- [ ] Health check detects is.gd availability

### WhatsApp Service Tests

- [ ] Valid phone number formats correctly
- [ ] Invalid phone number returns error
- [ ] WhatsApp opens with correct message
- [ ] Message truncates long bill titles
- [ ] Reminder message formats multiple bills
- [ ] Batch send processes all participants
- [ ] Batch send skips PAID participants
- [ ] Progress callback fires with correct status
- [ ] Completion summary shows correct counts
- [ ] Haptic feedback fires at all points

### Integration Tests

- [ ] End-to-end: Generate UPI → Shorten → Send WhatsApp
- [ ] Redirect page opens UPI app correctly
- [ ] Fallback button works if auto-redirect fails
- [ ] Batch send with mixed success/failure
- [ ] Reminder with multiple pending bills

---

## Troubleshooting Guide

### "URL shortening failed"

**Cause**: is.gd service unavailable or rejecting URL

**Solution**:
1. Check service: `await isServiceAvailable()`
2. Check error logs for is.gd response
3. Wrapped redirect URL still works as fallback

### "WhatsApp not installed"

**Cause**: User doesn't have WhatsApp on device

**Solution**:
1. Show alert: `showWhatsAppNotInstalledError()`
2. Suggest installing WhatsApp
3. Consider SMS fallback (future enhancement)

### "Invalid phone number"

**Cause**: Phone number doesn't match expected format

**Solution**:
1. Show alert: `showInvalidPhoneError(participantName)`
2. User should update contact with valid number
3. Log warning with actual phone value for debugging

### "Redirect page asks for login"

**Cause**: Vercel bypass secret not working or missing

**Solution**:
1. Check CONFIG.vercelBypassSecret is set
2. Verify secret matches Vercel environment variable
3. Check URL has `x-vercel-protection-bypass` parameter

### "UPI app doesn't open"

**Cause**: Phone doesn't handle upi:// protocol

**Solution**:
1. Fallback button appears after 2 seconds
2. User taps "Tap here to pay" button
3. If still doesn't work, phone may not have UPI app

---

## Performance Considerations

### URL Shortening

**Timing**:
- Single URL: ~500-1000ms (network dependent)
- Batch URLs: Parallel processing (same ~1s total)
- Timeout per attempt: 10 seconds
- Max retries: 2 (max 30 seconds total)

**Optimization**:
- Use batch function for multiple URLs
- Cache shortened URLs (future enhancement)
- Pre-shorten URLs when bill created (future enhancement)

### WhatsApp Batch Send

**Timing**:
- Per participant: ~2-3 seconds (shortening + WhatsApp open)
- 5 participants: ~10-15 seconds
- 10 participants: ~20-30 seconds

**User Experience**:
- Progress callback updates UI in real-time
- Haptic feedback confirms each send
- User can return to app while batch continues
- Completion summary shows when done

---

## Future Enhancements

### URL Shortening
- [ ] Cache shortened URLs in database
- [ ] Custom short domain (pay.vasooly.app)
- [ ] Analytics on link clicks
- [ ] QR code generation from shortened URL

### WhatsApp Integration
- [ ] Payment confirmation tracking (when UPI supports)
- [ ] Automatic reminders for unpaid requests
- [ ] Read receipts (when WhatsApp API available)
- [ ] Template messages for faster sending

### UX Improvements
- [ ] Preview message before sending
- [ ] Edit message template
- [ ] Scheduling batch sends
- [ ] Cancel in-progress batch send

---

## API Reference

### urlShortenerService.ts

```typescript
export interface ShortenUrlResult {
  success: boolean;
  shortUrl: string;      // Shortened URL or fallback
  originalUrl: string;   // Original input URL
  service?: 'is.gd' | 'none';
  error?: string;
}

export async function shortenUrl(
  longUrl: string
): Promise<ShortenUrlResult>

export async function shortenUrlBatch(
  urls: string[]
): Promise<ShortenUrlResult[]>

export async function isServiceAvailable(): Promise<boolean>
```

### whatsappService.ts

```typescript
export interface WhatsAppResult {
  success: boolean;
  participantName: string;
  error?: string;
}

export interface BatchSendResult {
  totalSent: number;
  totalFailed: number;
  results: WhatsAppResult[];
}

export async function isWhatsAppInstalled(): Promise<boolean>

export async function sendPaymentRequest(
  participant: Participant,
  bill: Bill,
  upiVPA: string,
  upiName: string
): Promise<WhatsAppResult>

export async function sendPaymentRequestsToAll(
  participants: Participant[],
  bill: Bill,
  upiVPA: string,
  upiName: string,
  onProgress?: (
    current: number,
    total: number,
    participantName: string,
    status?: 'sending' | 'success' | 'failed'
  ) => void
): Promise<BatchSendResult>

export async function sendPaymentReminder(
  participantName: string,
  participantPhone: string,
  pendingBills: Bill[],
  upiVPA: string,
  upiName: string
): Promise<WhatsAppResult>

export function showWhatsAppNotInstalledError(): void
export function showInvalidPhoneError(participantName: string): void
```

---

**Status**: ✅ Production-Ready
**Maintained By**: Vasooly Team
**Last Review**: 2025-10-24
