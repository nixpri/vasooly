/**
 * QR Code Service
 *
 * Manages QR code generation queue for React Native
 * Works with QRCodeCapture component to generate base64 PNG data
 */

type QRGenerationRequest = {
  value: string;
  size: number;
  resolve: (base64Data: string) => void;
  reject: (error: Error) => void;
};

class QRCodeService {
  private queue: QRGenerationRequest[] = [];
  private currentRequest: QRGenerationRequest | null = null;
  private listeners: Set<() => void> = new Set();

  /**
   * Request QR code generation
   * Returns a promise that resolves with base64 PNG data
   */
  generateQRCode(value: string, size: number = 280): Promise<string> {
    return new Promise((resolve, reject) => {
      const request: QRGenerationRequest = { value, size, resolve, reject };
      this.queue.push(request);
      this.notifyListeners();
      this.processQueue();
    });
  }

  /**
   * Get current request being processed
   */
  getCurrentRequest(): QRGenerationRequest | null {
    return this.currentRequest;
  }

  /**
   * Mark current request as completed
   */
  completeCurrentRequest(base64Data: string) {
    if (this.currentRequest) {
      this.currentRequest.resolve(base64Data);
      this.currentRequest = null;
      this.processQueue();
    }
  }

  /**
   * Mark current request as failed
   */
  failCurrentRequest(error: Error) {
    if (this.currentRequest) {
      this.currentRequest.reject(error);
      this.currentRequest = null;
      this.processQueue();
    }
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private processQueue() {
    if (this.currentRequest || this.queue.length === 0) {
      return;
    }

    this.currentRequest = this.queue.shift()!;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const qrCodeService = new QRCodeService();
