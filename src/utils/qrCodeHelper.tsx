/**
 * QR Code Helper for React Native
 *
 * Uses react-native-qrcode-svg's built-in toDataURL() method
 * Returns base64 PNG data for use with react-native-share
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeCaptureProps {
  value: string;
  size: number;
  onCaptured: (base64Data: string) => void;
  onError: (error: Error) => void;
}

/**
 * Hidden component that renders QR code and returns base64 PNG data
 * Must be mounted in the component tree to work
 */
export const QRCodeCapture: React.FC<QRCodeCaptureProps> = ({
  value,
  size,
  onCaptured,
  onError,
}) => {
  const qrRef = useRef<any>(null);

  useEffect(() => {
    const generateQRFile = async () => {
      try {
        // Wait for QR to render
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!qrRef.current) {
          throw new Error('QR ref not available');
        }

        // Get base64 data from QRCode using built-in toDataURL method
        qrRef.current.toDataURL((base64: string) => {
          try {
            // Return base64 data directly for use with react-native-share
            onCaptured(base64);
          } catch (error) {
            console.error('QR generation failed:', error);
            onError(error instanceof Error ? error : new Error('QR generation failed'));
          }
        });
      } catch (error) {
        console.error('QR generation failed:', error);
        onError(error instanceof Error ? error : new Error('QR generation failed'));
      }
    };

    generateQRFile();
  }, [value, size, onCaptured, onError]);

  return (
    <View style={styles.hidden}>
      <QRCode
        value={value}
        size={size}
        color="#000000"
        backgroundColor="#FFFFFF"
        ecl="H" // Highest error correction (30% damage tolerance)
        quietZone={10} // White border around QR for better recognition
        getRef={(ref) => (qrRef.current = ref)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    top: -10000,
    left: -10000,
    opacity: 0,
    pointerEvents: 'none',
  },
});
