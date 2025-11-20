/**
 * QR Code Manager
 *
 * Global component that handles QR code generation requests
 * Must be mounted at app root level
 */

import React, { useState, useEffect } from 'react';
import { QRCodeCapture } from '../utils/qrCodeHelper';
import { qrCodeService } from '../services/qrCodeService';

export const QRCodeManager: React.FC = () => {
  const [currentRequest, setCurrentRequest] = useState<{
    value: string;
    size: number;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = qrCodeService.subscribe(() => {
      const request = qrCodeService.getCurrentRequest();
      if (request) {
        setCurrentRequest({ value: request.value, size: request.size });
      } else {
        setCurrentRequest(null);
      }
    });

    return unsubscribe;
  }, []);

  if (!currentRequest) {
    return null;
  }

  return (
    <QRCodeCapture
      value={currentRequest.value}
      size={currentRequest.size}
      onCaptured={(uri) => {
        qrCodeService.completeCurrentRequest(uri);
      }}
      onError={(error) => {
        qrCodeService.failCurrentRequest(error);
      }}
    />
  );
};
