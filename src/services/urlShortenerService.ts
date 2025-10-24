/**
 * URL Shortener Service
 *
 * Shortens long UPI payment URLs using is.gd for cleaner WhatsApp messages.
 * Uses redirect wrapper for non-HTTP protocols (like upi://)
 *
 * Features:
 * - is.gd URL shortening service
 * - Automatic retry logic (2 retries)
 * - 10-second timeout per attempt
 * - Vercel bypass support for protected deployments
 * - Detailed error logging for debugging
 * - Type-safe responses
 */

export interface ShortenUrlResult {
  success: boolean;
  shortUrl: string;
  originalUrl: string;
  service?: 'is.gd' | 'none';
  error?: string;
}

/**
 * Configuration for URL shortening
 */
const CONFIG = {
  timeout: 10000, // 10 seconds per attempt
  maxRetries: 2, // 2 retries per service
  enableLogging: true, // Enable detailed logging

  // Redirect service URL for wrapping non-HTTP protocols (like upi://)
  // UPDATE THIS after deploying redirect-service to Vercel
  // Example: 'https://vasooly-redirect.vercel.app'
  redirectServiceUrl: 'https://vasooly-redirect-q2639ymjm-nikunjs-projects-129287b3.vercel.app', // Leave empty to skip wrapping (will use original URL)

  // Vercel Automation Bypass Secret for protected deployments
  // Set this if your Vercel deployment has protection enabled
  // The secret will be appended as ?x-vercel-protection-bypass={secret}
  vercelBypassSecret: 'nikunjtest123nikunjtest123nikunj', // Leave empty if no protection
};

/**
 * Logs debug information if logging is enabled
 */
function log(message: string, data?: unknown) {
  if (CONFIG.enableLogging) {
    console.log(`[URLShortener] ${message}`, data || '');
  }
}

/**
 * Logs error information
 */
function logError(message: string, error?: unknown) {
  console.error(`[URLShortener ERROR] ${message}`, error || '');
}

/**
 * Shortens URL using is.gd service
 * API: https://is.gd/create.php?format=json&url={url}
 */
async function shortenWithIsGd(longUrl: string, attempt: number = 1): Promise<ShortenUrlResult> {
  log(`Attempting is.gd (attempt ${attempt})`);

  try {
    const encodedUrl = encodeURIComponent(longUrl);
    const apiUrl = `https://is.gd/create.php?format=json&url=${encodedUrl}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logError(`is.gd HTTP ${response.status}`);
      return {
        success: false,
        shortUrl: longUrl,
        originalUrl: longUrl,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    log('is.gd response:', data);

    if (data.errormessage) {
      logError('is.gd API error:', data.errormessage);
      return {
        success: false,
        shortUrl: longUrl,
        originalUrl: longUrl,
        error: data.errormessage,
      };
    }

    if (data.shorturl) {
      log(`✅ is.gd success: ${data.shorturl}`);
      return {
        success: true,
        shortUrl: data.shorturl,
        originalUrl: longUrl,
        service: 'is.gd',
      };
    }

    logError('is.gd unexpected response:', data);
    return {
      success: false,
      shortUrl: longUrl,
      originalUrl: longUrl,
      error: 'Unexpected response format',
    };
  } catch (error) {
    logError('is.gd failed:', error);
    return {
      success: false,
      shortUrl: longUrl,
      originalUrl: longUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Tries a shortening function with retry logic
 */
async function tryWithRetry(
  shortenFn: (url: string, attempt: number) => Promise<ShortenUrlResult>,
  url: string
): Promise<ShortenUrlResult> {
  let lastResult: ShortenUrlResult | null = null;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    lastResult = await shortenFn(url, attempt);

    if (lastResult.success) {
      return lastResult;
    }

    // Don't retry if it's a client error (invalid URL, etc.)
    if (lastResult.error &&
        (lastResult.error.includes('Invalid') ||
         lastResult.error.includes('bad') ||
         lastResult.error.includes('HTTP 4'))) {
      log(`Skipping retry due to client error: ${lastResult.error}`);
      break;
    }

    if (attempt < CONFIG.maxRetries) {
      log(`Retrying in 500ms...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return lastResult!;
}

/**
 * Shortens a URL using is.gd service
 *
 * Wraps non-HTTP protocols (like upi://) with redirect service, then shortens
 * Gets 2 retry attempts before failing
 * Falls back to wrapped redirect URL or original URL if shortening fails
 *
 * @param longUrl - The long URL to shorten
 * @returns ShortenUrlResult with short URL or fallback to original
 *
 * @example
 * ```typescript
 * const result = await shortenUrl('upi://pay?pa=merchant@paytm&pn=John...');
 * console.log(result.shortUrl); // Shortened URL or original if fails
 * console.log(result.service); // Which service succeeded: 'is.gd' | 'none'
 * ```
 */
export async function shortenUrl(longUrl: string): Promise<ShortenUrlResult> {
  log(`=== Starting URL shortening ===`);
  log(`Original URL length: ${longUrl.length} chars`);

  // Validate input
  if (!longUrl || longUrl.trim().length === 0) {
    logError('Empty URL provided');
    return {
      success: false,
      shortUrl: longUrl,
      originalUrl: longUrl,
      service: 'none',
      error: 'Empty URL provided',
    };
  }

  // Check if URL uses a non-web protocol (like upi://, tel://, etc.)
  // URL shorteners only support http:// and https://
  let urlToShorten = longUrl;
  const isNonWebProtocol = !longUrl.startsWith('http://') && !longUrl.startsWith('https://');

  if (isNonWebProtocol) {
    const protocol = longUrl.split(':')[0];
    log(`⚠️ Non-web protocol detected (${protocol}://)`);

    if (CONFIG.redirectServiceUrl) {
      // Wrap non-web protocol URL with redirect service
      const encodedUrl = encodeURIComponent(longUrl);
      urlToShorten = `${CONFIG.redirectServiceUrl}/?to=${encodedUrl}`;

      // Append Vercel bypass secret if configured (for protected deployments)
      if (CONFIG.vercelBypassSecret) {
        urlToShorten += `&x-vercel-protection-bypass=${CONFIG.vercelBypassSecret}`;
        log(`🔐 Added Vercel protection bypass`);
      }

      log(`✅ Wrapped with redirect service: ${urlToShorten.substring(0, 80)}...`);
    } else {
      // No redirect service configured, return original URL
      log(`❌ No redirect service configured. Set CONFIG.redirectServiceUrl to enable shortening.`);
      log(`Returning original ${protocol}:// URL`);
      return {
        success: false,
        shortUrl: longUrl,
        originalUrl: longUrl,
        service: 'none',
        error: 'Redirect service not configured for non-web protocols',
      };
    }
  }

  // Try is.gd with retry logic
  log(`--- Trying is.gd ---`);
  const result = await tryWithRetry(shortenWithIsGd, urlToShorten);

  if (result.success) {
    log(`=== SUCCESS with is.gd ===`);
    log(`Shortened URL: ${result.shortUrl}`);
    log(`Original: ${longUrl.substring(0, 100)}...`);

    // Return with original URL reference
    return {
      ...result,
      originalUrl: longUrl, // Keep original URL, not the wrapped one
    };
  }

  // is.gd failed - return wrapped URL if available, otherwise original
  logError('is.gd URL shortening failed');

  if (isNonWebProtocol && CONFIG.redirectServiceUrl) {
    log(`Returning wrapped redirect URL (${urlToShorten.length} chars)`);
    return {
      success: false,
      shortUrl: urlToShorten, // Return the HTTP wrapper, not the original UPI URL
      originalUrl: longUrl,
      service: 'none',
      error: 'is.gd shortening failed, using redirect wrapper',
    };
  }

  log(`Returning original URL (${longUrl.length} chars)`);
  return {
    success: false,
    shortUrl: longUrl,
    originalUrl: longUrl,
    service: 'none',
    error: 'is.gd shortening failed',
  };
}

/**
 * Shortens multiple URLs in parallel
 *
 * @param urls - Array of long URLs to shorten
 * @returns Array of ShortenUrlResult
 *
 * @example
 * ```typescript
 * const urls = ['upi://pay?...', 'upi://pay?...'];
 * const results = await shortenUrlBatch(urls);
 * ```
 */
export async function shortenUrlBatch(urls: string[]): Promise<ShortenUrlResult[]> {
  try {
    log(`Batch shortening ${urls.length} URLs`);
    const promises = urls.map((url) => shortenUrl(url));
    const results = await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;
    log(`Batch complete: ${successCount}/${urls.length} succeeded`);

    return results;
  } catch (error) {
    logError('Batch URL shortening failed:', error);
    // Return fallback results for all URLs
    return urls.map((url) => ({
      success: false,
      shortUrl: url,
      originalUrl: url,
      service: 'none' as const,
      error: 'Batch operation failed',
    }));
  }
}

/**
 * Check if primary service (is.gd) is available
 * Useful for health checks and diagnostics
 *
 * @returns Whether the service is reachable
 */
export async function isServiceAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://is.gd', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const available = response.ok;
    log(`is.gd service check: ${available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
    return available;
  } catch (error) {
    logError('is.gd service check failed:', error);
    return false;
  }
}
