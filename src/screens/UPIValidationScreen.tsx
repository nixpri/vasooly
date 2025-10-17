import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateUPILink } from '../lib/business/upiGenerator';
import {
  validateUPILink,
  selectBestURI,
  getCurrentDevice,
  UPIValidationResult,
  UPIAppAvailability,
} from '../lib/platform/upiValidation';
import { generateQRCode } from '../lib/business/qrCodeGenerator';

export const UPIValidationScreen: React.FC = () => {
  const [validationResult, setValidationResult] =
    useState<UPIValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [testStatus, setTestStatus] = useState<string>('Not tested');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const TEST_VPA = 'test@paytm';
  const TEST_NAME = 'Test Merchant';
  const TEST_AMOUNT = 100; // ₹1.00

  const runValidation = async () => {
    setIsValidating(true);
    setTestStatus('Running validation...');

    try {
      // Generate test UPI link
      const upiLink = generateUPILink({
        pa: TEST_VPA,
        pn: TEST_NAME,
        am: TEST_AMOUNT,
        tn: 'UPI Validation Test',
      });

      // Validate on current device
      const result = await validateUPILink(upiLink);
      setValidationResult(result);

      // Update status
      const installedCount = result.appAvailability.filter(
        (a) => a.isInstalled
      ).length;
      setTestStatus(`Found ${installedCount} UPI apps`);
    } catch (error) {
      setTestStatus(`Error: ${error}`);
      Alert.alert('Validation Error', String(error));
    } finally {
      setIsValidating(false);
    }
  };

  const testUPILink = async (useStandard: boolean) => {
    if (!validationResult) return;

    try {
      const upiLink = generateUPILink({
        pa: TEST_VPA,
        pn: TEST_NAME,
        am: TEST_AMOUNT,
        tn: 'Test Payment',
      });

      let uriToOpen: string;
      if (useStandard) {
        uriToOpen = upiLink.standardUri;
      } else {
        uriToOpen = selectBestURI(upiLink, validationResult);
      }

      const canOpen = await Linking.canOpenURL(uriToOpen);
      if (canOpen) {
        await Linking.openURL(uriToOpen);
      } else {
        Alert.alert('Cannot Open', `URI cannot be opened: ${uriToOpen}`);
      }
    } catch (error) {
      Alert.alert('Error Opening Link', String(error));
    }
  };

  const testQRCode = async () => {
    try {
      const qrCode = await generateQRCode({
        pa: TEST_VPA,
        pn: TEST_NAME,
        am: TEST_AMOUNT,
        tn: 'QR Code Test',
      });
      setQrCodeData(qrCode.data);
      Alert.alert(
        'QR Code Generated',
        `Scan with UPI app to test ₹${TEST_AMOUNT} payment`
      );
    } catch (error) {
      Alert.alert('QR Generation Error', String(error));
    }
  };

  const copyDeviceInfo = () => {
    if (!validationResult) return;

    const device = validationResult.device;
    const info = `Device: ${device.model}\nOS: ${device.os} ${device.version}`;
    Alert.alert('Device Info', info);
  };

  const renderAppStatus = (app: UPIAppAvailability) => {
    return (
      <View key={app.app} style={styles.appRow}>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{app.app}</Text>
          {app.packageName && (
            <Text style={styles.packageName}>{app.packageName}</Text>
          )}
        </View>
        <View style={styles.appStatus}>
          {app.isInstalled ? (
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, styles.statusInstalled]} />
              <Text style={styles.statusText}>Installed</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusBadgeGray]}>
              <View style={[styles.statusDot, styles.statusNotInstalled]} />
              <Text style={[styles.statusText, styles.statusTextGray]}>
                Not Installed
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const device = getCurrentDevice();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>UPI Validation</Text>
        <Text style={styles.subtitle}>Week 2 Day 1-2 Testing Framework</Text>

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Current Device</Text>
          <Pressable style={styles.infoCard} onPress={copyDeviceInfo}>
            <Text style={styles.infoLabel}>Model:</Text>
            <Text style={styles.infoValue}>{device.model}</Text>
            <Text style={styles.infoLabel}>OS:</Text>
            <Text style={styles.infoValue}>
              {device.os} {device.version}
            </Text>
          </Pressable>
        </View>

        {/* Validation Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Validation Tests</Text>

          <Pressable
            style={[styles.button, isValidating && styles.buttonDisabled]}
            onPress={runValidation}
            disabled={isValidating}
          >
            <Text style={styles.buttonText}>
              {isValidating ? 'Validating...' : 'Run UPI Validation'}
            </Text>
          </Pressable>

          <Text style={styles.testStatus}>{testStatus}</Text>
        </View>

        {/* Validation Results */}
        {validationResult && (
          <>
            {/* Standard URI Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Standard UPI Link</Text>
              <View
                style={[
                  styles.resultCard,
                  validationResult.standardUriWorks
                    ? styles.resultSuccess
                    : styles.resultFail,
                ]}
              >
                <Text style={styles.resultText}>
                  {validationResult.standardUriWorks
                    ? '✅ Standard URI Works'
                    : '❌ Standard URI Not Supported'}
                </Text>
              </View>
            </View>

            {/* App Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                UPI Apps ({validationResult.appAvailability.filter((a) => a.isInstalled).length}/5
                installed)
              </Text>
              <View style={styles.appsContainer}>
                {validationResult.appAvailability.map(renderAppStatus)}
              </View>
            </View>

            {/* Recommended App */}
            {validationResult.recommendedApp && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended</Text>
                <View style={styles.recommendedCard}>
                  <Text style={styles.recommendedText}>
                    {validationResult.recommendedApp}
                  </Text>
                  <Text style={styles.recommendedSubtext}>
                    Best fallback URI for this device
                  </Text>
                </View>
              </View>
            )}

            {/* QR Code Support */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QR Code</Text>
              <View
                style={[
                  styles.resultCard,
                  validationResult.qrCodeSupported
                    ? styles.resultSuccess
                    : styles.resultFail,
                ]}
              >
                <Text style={styles.resultText}>
                  {validationResult.qrCodeSupported
                    ? '✅ QR Code Supported'
                    : '❌ No UPI Apps for QR'}
                </Text>
              </View>
            </View>

            {/* Test Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧪 Live Tests</Text>

              <Pressable style={styles.button} onPress={() => testUPILink(true)}>
                <Text style={styles.buttonText}>Test Standard URI</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => testUPILink(false)}
              >
                <Text style={styles.buttonText}>Test Best URI (Smart)</Text>
              </Pressable>

              <Pressable style={styles.button} onPress={testQRCode}>
                <Text style={styles.buttonText}>Generate QR Code</Text>
              </Pressable>

              {qrCodeData && (
                <View style={styles.qrCodeContainer}>
                  <Text style={styles.qrCodeTitle}>Scan to Pay ₹{TEST_AMOUNT}</Text>
                  <View style={styles.qrCodeWrapper}>
                    <QRCode
                      value={qrCodeData}
                      size={250}
                      backgroundColor="white"
                      color="black"
                    />
                  </View>
                  <Text style={styles.qrCodeSubtext}>
                    Scan with any UPI app (GPay, PhonePe, Paytm)
                  </Text>
                </View>
              )}

              <Text style={styles.warningText}>
                ⚠️ Live tests will open UPI app with ₹100 payment. Cancel in
                app.
              </Text>
            </View>
          </>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Testing Checklist</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionItem}>1. Run UPI Validation</Text>
            <Text style={styles.instructionItem}>
              2. Check which UPI apps are installed
            </Text>
            <Text style={styles.instructionItem}>
              3. Test Standard URI (see if it opens)
            </Text>
            <Text style={styles.instructionItem}>
              4. Test Smart URI (uses fallback)
            </Text>
            <Text style={styles.instructionItem}>
              5. Generate QR code and scan with UPI app
            </Text>
            <Text style={styles.instructionItem}>
              6. Document results in testing matrix
            </Text>
          </View>
        </View>

        {/* Success Criteria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Success Criteria</Text>
          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaText}>
              • At least 1 UPI app installed
            </Text>
            <Text style={styles.criteriaText}>
              • Standard OR fallback URI works
            </Text>
            <Text style={styles.criteriaText}>• QR code can be generated</Text>
            <Text style={styles.criteriaText}>
              • 8/10 devices must pass (production)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  button: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  testStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  resultSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  resultFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  appsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  appStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeGray: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusInstalled: {
    backgroundColor: '#22c55e',
  },
  statusNotInstalled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextGray: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  recommendedCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  recommendedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 4,
  },
  recommendedSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  warningText: {
    fontSize: 12,
    color: 'rgba(251, 191, 36, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  qrCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrCodeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  instructionItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
  criteriaCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  criteriaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
});
