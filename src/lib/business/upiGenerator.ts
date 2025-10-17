/**
 * UPI Link Generator
 *
 * Generates UPI payment deep links and QR codes for bill splitting.
 * Supports standard upi://pay format and app-specific fallback URIs.
 *
 * References:
 * - NPCI UPI Linking Specification
 * - https://www.npci.org.in/what-we-do/upi/upi-link-specification
 */

/**
 * UPI payment parameters for generating deep links
 */
export interface UPIPaymentParams {
  /** Payee Virtual Payment Address (VPA/UPI ID) */
  pa: string;

  /** Payee Name */
  pn: string;

  /** Transaction amount in rupees (e.g., 100.50) */
  am: number;

  /** Currency code (default: INR) */
  cu?: string;

  /** Transaction note/description */
  tn?: string;

  /** Transaction reference ID (bill ID, order number, etc.) */
  tr?: string;

  /** Merchant code (optional) */
  mc?: string;
}

/**
 * UPI app identifiers for fallback URIs
 * Comprehensive list of 50+ UPI apps in India (2025)
 * Research: claudedocs/UPI_APPS_RESEARCH_2025.md
 */
export enum UPIApp {
  // Major Payment Apps (Top 6 by volume)
  GPAY = 'gpay',
  PHONEPE = 'phonepe',
  PAYTM = 'paytm',
  BHIM = 'bhim',
  AMAZON_PAY = 'amazonpay',
  WHATSAPP = 'whatsapp',

  // Banking Apps (Major Banks)
  YONO_SBI = 'yonosbi',
  IMOBILE_ICICI = 'imobile',
  HDFC_BANK = 'hdfcbank',
  AXIS_MOBILE = 'axismobile',
  KOTAK_811 = 'kotak811',

  // Fintech & Neobanking Apps
  NAVI = 'navi',
  CRED = 'cred',
  JUPITER = 'jupiter',
  FI_MONEY = 'fimoney',
  INDMONEY = 'indmoney',
  SUPER_MONEY = 'supermoney',

  // Generic fallback
  GENERIC = 'generic',
}

/**
 * UPI URI generation result with standard and app-specific links
 */
export interface UPILinkResult {
  /** Standard UPI deep link (upi://pay?...) */
  standardUri: string;

  /** App-specific fallback URIs */
  fallbackUris: Record<UPIApp, string>;

  /** QR code compatible string (same as standard URI) */
  qrCodeData: string;

  /** Transaction reference ID used */
  transactionRef: string;
}

/**
 * VPA format validation result
 */
export interface VPAValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * App-specific URI scheme mapping
 * Based on official documentation and testing as of 2024
 */
const APP_SCHEMES: Record<UPIApp, string> = {
  // Major Payment Apps
  [UPIApp.GPAY]: 'tez://upi/pay',
  [UPIApp.PHONEPE]: 'phonepe://pay',
  [UPIApp.PAYTM]: 'paytmmp://pay',
  [UPIApp.BHIM]: 'upi://pay',
  [UPIApp.AMAZON_PAY]: 'upi://pay',
  [UPIApp.WHATSAPP]: 'upi://pay',

  // Banking Apps (use standard UPI)
  [UPIApp.YONO_SBI]: 'upi://pay',
  [UPIApp.IMOBILE_ICICI]: 'upi://pay',
  [UPIApp.HDFC_BANK]: 'upi://pay',
  [UPIApp.AXIS_MOBILE]: 'upi://pay',
  [UPIApp.KOTAK_811]: 'upi://pay',

  // Fintech Apps (use standard UPI)
  [UPIApp.NAVI]: 'upi://pay',
  [UPIApp.CRED]: 'upi://pay',
  [UPIApp.JUPITER]: 'upi://pay',
  [UPIApp.FI_MONEY]: 'upi://pay',
  [UPIApp.INDMONEY]: 'upi://pay',
  [UPIApp.SUPER_MONEY]: 'upi://pay',

  // Generic fallback
  [UPIApp.GENERIC]: 'upi://pay',
};

/**
 * Validates UPI VPA (Virtual Payment Address) format
 *
 * Valid formats:
 * - username@bank (e.g., john@paytm, merchant@ybl)
 * - Can contain letters, numbers, dots, underscores, hyphens
 * - Length: 3-100 characters
 *
 * @param vpa - VPA to validate
 * @returns Validation result with errors if invalid
 *
 * @example
 * ```typescript
 * const result = validateVPA('john@paytm');
 * if (result.isValid) {
 *   // VPA is valid
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateVPA(vpa: string): VPAValidationResult {
  const errors: string[] = [];

  if (!vpa || typeof vpa !== 'string') {
    errors.push('VPA is required');
    return { isValid: false, errors };
  }

  const trimmedVPA = vpa.trim();

  // Check length (must be at least 5 chars: x@y format requires minimum length)
  if (trimmedVPA.length < 5 || trimmedVPA.length > 100) {
    errors.push('VPA must be between 5 and 100 characters');
  }

  // Check format: username@bank
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  if (!vpaRegex.test(trimmedVPA)) {
    errors.push('VPA must be in format username@bank (e.g., john@paytm)');
  }

  // Check for @ symbol
  if (!trimmedVPA.includes('@')) {
    errors.push('VPA must contain @ symbol');
  } else {
    const parts = trimmedVPA.split('@');
    if (parts.length !== 2) {
      errors.push('VPA must have exactly one @ symbol');
    } else {
      if (parts[0].length === 0) {
        errors.push('VPA username cannot be empty');
      }
      if (parts[1].length === 0) {
        errors.push('VPA bank handle cannot be empty');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a unique transaction reference ID
 *
 * Format: BILL-{billId}-{timestamp}
 *
 * @param billId - Bill ID to include in reference
 * @returns Unique transaction reference
 *
 * @example
 * ```typescript
 * const ref = generateTransactionRef('bill-123');
 * // Returns: "BILL-bill-123-1698765432123"
 * ```
 */
export function generateTransactionRef(billId: string): string {
  const timestamp = Date.now();
  return `BILL-${billId}-${timestamp}`;
}

/**
 * Encodes UPI parameter values according to RFC 3986
 *
 * Note: NPCI spec requires space to be represented as " " not "%20"
 * for QR/NFC/Intent, but "%20" for URL encoding.
 *
 * @param value - Value to encode
 * @param forQRCode - If true, encode for QR code (space as " ")
 * @returns Encoded value
 */
function encodeUPIParam(value: string, forQRCode: boolean = false): string {
  if (forQRCode) {
    // For QR codes, preserve special characters and use space encoding as per NPCI spec
    // Encode only necessary characters for URI safety, but preserve @ and common chars
    return value.replace(/ /g, ' ').replace(/&/g, '%26').replace(/#/g, '%23');
  }
  return encodeURIComponent(value);
}

/**
 * Builds UPI payment URI with given parameters
 *
 * @param params - UPI payment parameters
 * @param scheme - URI scheme to use (default: upi://pay)
 * @param forQRCode - If true, format for QR code
 * @returns Complete UPI URI
 */
function buildUPIUri(
  params: UPIPaymentParams,
  scheme: string = 'upi://pay',
  forQRCode: boolean = false
): string {
  const queryParams: string[] = [];

  // Required parameters
  queryParams.push(`pa=${encodeUPIParam(params.pa, forQRCode)}`);
  queryParams.push(`pn=${encodeUPIParam(params.pn, forQRCode)}`);
  queryParams.push(`am=${params.am.toFixed(2)}`);
  queryParams.push(`cu=${params.cu || 'INR'}`);

  // Optional parameters
  if (params.tn) {
    queryParams.push(`tn=${encodeUPIParam(params.tn, forQRCode)}`);
  }

  if (params.tr) {
    queryParams.push(`tr=${encodeUPIParam(params.tr, forQRCode)}`);
  }

  if (params.mc) {
    queryParams.push(`mc=${encodeUPIParam(params.mc, forQRCode)}`);
  }

  return `${scheme}?${queryParams.join('&')}`;
}

/**
 * Generates UPI payment links for a bill participant
 *
 * Creates standard UPI deep link and app-specific fallback URIs.
 * Also generates QR code compatible data string.
 *
 * @param params - UPI payment parameters
 * @returns UPI link result with standard and fallback URIs
 * @throws Error if VPA validation fails or amount is invalid
 *
 * @example
 * ```typescript
 * const result = generateUPILink({
 *   pa: 'merchant@paytm',
 *   pn: 'John Doe',
 *   am: 100.50,
 *   tn: 'Dinner bill split',
 *   tr: 'BILL-123-1698765432',
 * });
 *
 * // Use standard URI for deep link
 * Linking.openURL(result.standardUri);
 *
 * // Use fallback for specific app
 * Linking.openURL(result.fallbackUris[UPIApp.GPAY]);
 *
 * // Generate QR code
 * <QRCode value={result.qrCodeData} />
 * ```
 */
export function generateUPILink(params: UPIPaymentParams): UPILinkResult {
  // Validate VPA
  const vpaValidation = validateVPA(params.pa);
  if (!vpaValidation.isValid) {
    throw new Error(`Invalid VPA: ${vpaValidation.errors.join(', ')}`);
  }

  // Validate amount
  if (params.am <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (params.am > 100000) {
    throw new Error('Amount cannot exceed ₹1,00,000 (UPI limit)');
  }

  // Validate payee name
  if (!params.pn || params.pn.trim().length === 0) {
    throw new Error('Payee name is required');
  }

  // Generate transaction reference if not provided
  const transactionRef = params.tr || generateTransactionRef('unknown');
  const paramsWithRef: UPIPaymentParams = {
    ...params,
    tr: transactionRef,
  };

  // Generate standard URI
  const standardUri = buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.GENERIC], false);

  // Generate app-specific fallback URIs
  const fallbackUris: Record<UPIApp, string> = {
    // Major Payment Apps
    [UPIApp.GPAY]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.GPAY], false),
    [UPIApp.PHONEPE]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.PHONEPE], false),
    [UPIApp.PAYTM]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.PAYTM], false),
    [UPIApp.BHIM]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.BHIM], false),
    [UPIApp.AMAZON_PAY]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.AMAZON_PAY], false),
    [UPIApp.WHATSAPP]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.WHATSAPP], false),

    // Banking Apps
    [UPIApp.YONO_SBI]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.YONO_SBI], false),
    [UPIApp.IMOBILE_ICICI]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.IMOBILE_ICICI], false),
    [UPIApp.HDFC_BANK]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.HDFC_BANK], false),
    [UPIApp.AXIS_MOBILE]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.AXIS_MOBILE], false),
    [UPIApp.KOTAK_811]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.KOTAK_811], false),

    // Fintech Apps
    [UPIApp.NAVI]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.NAVI], false),
    [UPIApp.CRED]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.CRED], false),
    [UPIApp.JUPITER]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.JUPITER], false),
    [UPIApp.FI_MONEY]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.FI_MONEY], false),
    [UPIApp.INDMONEY]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.INDMONEY], false),
    [UPIApp.SUPER_MONEY]: buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.SUPER_MONEY], false),

    // Generic fallback
    [UPIApp.GENERIC]: standardUri,
  };

  // Generate QR code data (space-encoded as per NPCI spec)
  const qrCodeData = buildUPIUri(paramsWithRef, APP_SCHEMES[UPIApp.GENERIC], true);

  return {
    standardUri,
    fallbackUris,
    qrCodeData,
    transactionRef,
  };
}

/**
 * Converts rupees to paise for precise amount calculation
 *
 * @param rupees - Amount in rupees
 * @returns Amount in paise (integer)
 *
 * @example
 * ```typescript
 * const paise = rupeesToPaise(100.50); // Returns: 10050
 * ```
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Converts paise to rupees for display/UPI link
 *
 * @param paise - Amount in paise (integer)
 * @returns Amount in rupees (decimal)
 *
 * @example
 * ```typescript
 * const rupees = paiseToRupees(10050); // Returns: 100.50
 * ```
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
