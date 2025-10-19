/**
 * File Picker Service Tests
 *
 * Comprehensive tests for file picker utility functions
 */

import {
  formatFileSize,
  getFileTypeDisplayName,
  getFileIcon,
  isImage,
  isPDF,
  getFilePickerErrorMessage,
  DEFAULT_VALIDATION_OPTIONS,
} from '../filePickerService';
import type { FilePickerResult } from '../filePickerService';

describe('File Picker Service', () => {
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle large files', () => {
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
      expect(formatFileSize(99.9 * 1024 * 1024)).toBe('99.9 MB');
    });
  });

  describe('getFileTypeDisplayName', () => {
    it('should return display name for JPEG', () => {
      expect(getFileTypeDisplayName('image/jpeg')).toBe('JPEG Image');
    });

    it('should return display name for PNG', () => {
      expect(getFileTypeDisplayName('image/png')).toBe('PNG Image');
    });

    it('should return display name for PDF', () => {
      expect(getFileTypeDisplayName('application/pdf')).toBe('PDF Document');
    });

    it('should return Unknown for unsupported types', () => {
      expect(getFileTypeDisplayName('application/octet-stream')).toBe('Unknown');
      expect(getFileTypeDisplayName('text/plain')).toBe('Unknown');
    });
  });

  describe('getFileIcon', () => {
    it('should return image icon for image types', () => {
      expect(getFileIcon('image/jpeg')).toBe('🖼️');
      expect(getFileIcon('image/png')).toBe('🖼️');
      expect(getFileIcon('image/gif')).toBe('🖼️');
    });

    it('should return PDF icon for PDF', () => {
      expect(getFileIcon('application/pdf')).toBe('📄');
    });

    it('should return generic icon for other types', () => {
      expect(getFileIcon('application/octet-stream')).toBe('📎');
      expect(getFileIcon('text/plain')).toBe('📎');
    });
  });

  describe('isImage', () => {
    it('should return true for image MIME types', () => {
      expect(isImage('image/jpeg')).toBe(true);
      expect(isImage('image/png')).toBe(true);
      expect(isImage('image/gif')).toBe(true);
      expect(isImage('image/webp')).toBe(true);
    });

    it('should return false for non-image types', () => {
      expect(isImage('application/pdf')).toBe(false);
      expect(isImage('text/plain')).toBe(false);
      expect(isImage('application/octet-stream')).toBe(false);
    });
  });

  describe('isPDF', () => {
    it('should return true for PDF MIME type', () => {
      expect(isPDF('application/pdf')).toBe(true);
    });

    it('should return false for non-PDF types', () => {
      expect(isPDF('image/jpeg')).toBe(false);
      expect(isPDF('image/png')).toBe(false);
      expect(isPDF('text/plain')).toBe(false);
    });
  });

  describe('getFilePickerErrorMessage', () => {
    it('should return empty string for successful result', () => {
      const result: FilePickerResult = {
        success: true,
        file: {
          uri: 'file://test.pdf',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
        },
      };

      expect(getFilePickerErrorMessage(result)).toBe('');
    });

    it('should return cancellation message', () => {
      const result: FilePickerResult = {
        success: false,
        cancelled: true,
        error: 'File selection cancelled',
      };

      expect(getFilePickerErrorMessage(result)).toBe('File selection cancelled');
    });

    it('should return error message', () => {
      const result: FilePickerResult = {
        success: false,
        error: 'File too large',
      };

      expect(getFilePickerErrorMessage(result)).toBe('File too large');
    });

    it('should return empty string when no error', () => {
      const result: FilePickerResult = {
        success: false,
      };

      expect(getFilePickerErrorMessage(result)).toBe('');
    });
  });

  describe('DEFAULT_VALIDATION_OPTIONS', () => {
    it('should have correct max size', () => {
      expect(DEFAULT_VALIDATION_OPTIONS.maxSize).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should allow images and PDFs', () => {
      expect(DEFAULT_VALIDATION_OPTIONS.allowedMimeTypes).toContain('image/jpeg');
      expect(DEFAULT_VALIDATION_OPTIONS.allowedMimeTypes).toContain('image/png');
      expect(DEFAULT_VALIDATION_OPTIONS.allowedMimeTypes).toContain('application/pdf');
    });

    it('should allow correct extensions', () => {
      expect(DEFAULT_VALIDATION_OPTIONS.allowedExtensions).toContain('.jpg');
      expect(DEFAULT_VALIDATION_OPTIONS.allowedExtensions).toContain('.jpeg');
      expect(DEFAULT_VALIDATION_OPTIONS.allowedExtensions).toContain('.png');
      expect(DEFAULT_VALIDATION_OPTIONS.allowedExtensions).toContain('.pdf');
    });
  });
});
