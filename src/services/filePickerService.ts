/**
 * File Picker Service
 *
 * Handles document and image picking for bill attachments
 * with validation and file size management.
 *
 * Features:
 * - Image picker (JPEG, PNG)
 * - PDF picker
 * - File size validation (max 10MB)
 * - MIME type validation
 * - Error handling
 * - No OCR processing (per MVP scope)
 */

import * as DocumentPicker from 'expo-document-picker';

export interface FilePickerResult {
  success: boolean;
  file?: {
    uri: string;
    name: string;
    size: number;
    mimeType: string;
  };
  error?: string;
  cancelled?: boolean;
}

export interface FileValidationOptions {
  /**
   * Maximum file size in bytes
   * @default 10485760 (10MB)
   */
  maxSize?: number;

  /**
   * Allowed MIME types
   * @default ['image/jpeg', 'image/png', 'application/pdf']
   */
  allowedMimeTypes?: string[];

  /**
   * Allowed file extensions
   * @default ['.jpg', '.jpeg', '.png', '.pdf']
   */
  allowedExtensions?: string[];
}

/**
 * Default validation options
 */
export const DEFAULT_VALIDATION_OPTIONS: Required<FileValidationOptions> = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
};

/**
 * Pick an image file (JPEG or PNG)
 *
 * @param options Validation options
 * @returns FilePickerResult
 */
export async function pickImage(
  options?: Partial<FileValidationOptions>
): Promise<FilePickerResult> {
  const validationOptions = {
    ...DEFAULT_VALIDATION_OPTIONS,
    ...options,
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
  };

  return await pickDocument(validationOptions);
}

/**
 * Pick a PDF file
 *
 * @param options Validation options
 * @returns FilePickerResult
 */
export async function pickPDF(
  options?: Partial<FileValidationOptions>
): Promise<FilePickerResult> {
  const validationOptions = {
    ...DEFAULT_VALIDATION_OPTIONS,
    ...options,
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
  };

  return await pickDocument(validationOptions);
}

/**
 * Pick any supported document (image or PDF)
 *
 * @param options Validation options
 * @returns FilePickerResult
 */
export async function pickDocument(
  options?: FileValidationOptions
): Promise<FilePickerResult> {
  try {
    const validationOptions = {
      ...DEFAULT_VALIDATION_OPTIONS,
      ...options,
    };

    const result = await DocumentPicker.getDocumentAsync({
      type: validationOptions.allowedMimeTypes,
      copyToCacheDirectory: true,
      multiple: false,
    });

    // Handle cancellation
    if (result.canceled) {
      return {
        success: false,
        cancelled: true,
        error: 'File selection cancelled',
      };
    }

    // Validate result
    if (!result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'No file selected',
      };
    }

    const asset = result.assets[0];

    // Validate file
    const validation = validateFile(asset, validationOptions);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      file: {
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        mimeType: asset.mimeType || 'application/octet-stream',
      },
    };
  } catch (error) {
    console.error('Error picking document:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to pick document',
    };
  }
}

/**
 * Pick multiple documents
 *
 * @param maxCount Maximum number of files to pick
 * @param options Validation options
 * @returns Array of FilePickerResult
 */
export async function pickMultipleDocuments(
  maxCount: number = 5,
  options?: FileValidationOptions
): Promise<FilePickerResult[]> {
  try {
    const validationOptions = {
      ...DEFAULT_VALIDATION_OPTIONS,
      ...options,
    };

    const result = await DocumentPicker.getDocumentAsync({
      type: validationOptions.allowedMimeTypes,
      copyToCacheDirectory: true,
      multiple: true,
    });

    // Handle cancellation
    if (result.canceled) {
      return [
        {
          success: false,
          cancelled: true,
          error: 'File selection cancelled',
        },
      ];
    }

    // Validate result
    if (!result.assets || result.assets.length === 0) {
      return [
        {
          success: false,
          error: 'No files selected',
        },
      ];
    }

    // Limit to maxCount
    const assets = result.assets.slice(0, maxCount);

    // Validate and map each file
    return assets.map((asset) => {
      const validation = validateFile(asset, validationOptions);

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      return {
        success: true,
        file: {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/octet-stream',
        },
      };
    });
  } catch (error) {
    console.error('Error picking multiple documents:', error);
    return [
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to pick documents',
      },
    ];
  }
}

/**
 * Validate a file against validation options
 *
 * @param asset Document asset
 * @param options Validation options
 * @returns Validation result
 */
function validateFile(
  asset: {
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  },
  options: Required<FileValidationOptions>
): { valid: boolean; error?: string } {
  // Check file size
  if (asset.size && asset.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (asset.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  // Check MIME type
  if (asset.mimeType && !options.allowedMimeTypes.includes(asset.mimeType)) {
    return {
      valid: false,
      error: `File type '${asset.mimeType}' is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
    };
  }

  // Check file extension
  const extension = asset.name
    .substring(asset.name.lastIndexOf('.'))
    .toLowerCase();

  if (!options.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension '${extension}' is not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 *
 * @param bytes File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Get file type display name
 *
 * @param mimeType MIME type
 * @returns Human-readable file type
 */
export function getFileTypeDisplayName(mimeType: string): string {
  const types: Record<string, string> = {
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'application/pdf': 'PDF Document',
  };

  return types[mimeType] || 'Unknown';
}

/**
 * Get file icon emoji
 *
 * @param mimeType MIME type
 * @returns Emoji representing the file type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  } else if (mimeType === 'application/pdf') {
    return '📄';
  } else {
    return '📎';
  }
}

/**
 * Check if file is an image
 *
 * @param mimeType MIME type
 * @returns Whether file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 *
 * @param mimeType MIME type
 * @returns Whether file is a PDF
 */
export function isPDF(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Get formatted error message for UI display
 *
 * @param result FilePickerResult
 * @returns User-friendly error message
 */
export function getFilePickerErrorMessage(result: FilePickerResult): string {
  if (!result.error) return '';

  if (result.cancelled) {
    return 'File selection cancelled';
  }

  return result.error;
}
