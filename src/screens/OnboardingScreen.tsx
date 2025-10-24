/**
 * OnboardingScreen - Multi-step onboarding flow
 *
 * Introduces new users to Vasooly's core features through
 * 4 screens: 3 illustrated feature screens + UPI ID collection.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSettingsStore } from '@/stores';
import {
  OnboardingPagination,
  BillSplittingIllustration,
  SettlementTrackingIllustration,
  FriendGroupsIllustration,
} from '@/components';
import { tokens, radius } from '@/theme/tokens';
import { validateVPA } from '@/lib/business/upiGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface ScreenData {
  id: number;
  title: string;
  description: string;
  Illustration: React.FC<{ size?: number }>;
}

const ONBOARDING_SCREENS: ScreenData[] = [
  {
    id: 0,
    title: 'Split & Send in 60 Seconds',
    description: 'Split any bill, generate UPI payment links, and send to friends via WhatsApp or SMS. They don\'t need the app!',
    Illustration: BillSplittingIllustration,
  },
  {
    id: 1,
    title: 'Track & Remind Effortlessly',
    description: 'See who paid, who owes. Send automatic reminders to friends who haven\'t settled up yet',
    Illustration: SettlementTrackingIllustration,
  },
  {
    id: 2,
    title: 'Organize & Analyze',
    description: 'Group expenses by trips or friends. Get insights on spending patterns and settlement rates',
    Illustration: FriendGroupsIllustration,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiError, setUpiError] = useState('');
  const { setOnboardingCompleted, setDefaultVPA } = useSettingsStore();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const handleNext = () => {
    // Allow navigation to the 4th screen (UPI setup)
    if (currentIndex < 3) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleUpiIdChange = (text: string) => {
    setUpiId(text.trim());
    setUpiError(''); // Clear error on input change
  };

  const handleUpiNameChange = (text: string) => {
    setUpiName(text);
    setUpiError(''); // Clear error on input change
  };

  const handleCompleteSetup = async () => {
    // Validate UPI ID
    if (!upiId) {
      setUpiError('UPI ID is required to use Vasooly');
      return;
    }

    if (!upiName) {
      setUpiError('UPI Name is required');
      return;
    }

    const validation = validateVPA(upiId);
    if (!validation.isValid) {
      setUpiError('Invalid UPI ID format. Use format: username@bankname (e.g., john@paytm)');
      return;
    }

    try {
      // Save UPI details to settings
      await setDefaultVPA(upiId, upiName);

      // Mark onboarding as completed
      await setOnboardingCompleted(true);

      // Complete onboarding
      onComplete();
    } catch (error) {
      setUpiError('Failed to save UPI details. Please try again.');
      console.error('Error saving UPI details:', error);
    }
  };

  const isUpiScreen = currentIndex === 3;

  return (
    <View style={styles.container}>
      {/* Horizontal Scrolling Screens */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {ONBOARDING_SCREENS.map((screen, index) => (
          <View key={screen.id} style={styles.screenContainer}>
            <Animated.View
              entering={FadeInDown.delay(index * 100).duration(600)}
              style={styles.contentContainer}
            >
              {/* Illustration */}
              <View style={styles.illustrationContainer}>
                <screen.Illustration size={340} />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                {index === 0 ? (
                  <Image
                    source={require('../../assets/vasooly-logo.png')}
                    style={styles.onboardingLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.title}>{screen.title}</Text>
                )}
                <Text style={styles.description}>{screen.description}</Text>
              </View>
            </Animated.View>
          </View>
        ))}

        {/* 4th Screen - UPI Setup */}
        <View key="upi-setup" style={styles.screenContainer}>
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.contentContainer}
          >
            {/* UPI Icon/Title */}
            <View style={styles.upiHeaderContainer}>
              <Text style={styles.upiEmoji}>💳</Text>
              <Text style={styles.title}>Setup Payment Collection</Text>
              <Text style={styles.description}>
                Enter your UPI ID to receive payments from friends
              </Text>
            </View>

            {/* UPI Form */}
            <View style={styles.upiFormContainer}>
              {/* UPI ID Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>UPI ID *</Text>
                <TextInput
                  style={[styles.input, upiError ? styles.inputError : null]}
                  value={upiId}
                  onChangeText={handleUpiIdChange}
                  placeholder="yourname@paytm"
                  placeholderTextColor={tokens.colors.text.tertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>

              {/* UPI Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name on UPI *</Text>
                <TextInput
                  style={styles.input}
                  value={upiName}
                  onChangeText={handleUpiNameChange}
                  placeholder="Your Full Name"
                  placeholderTextColor={tokens.colors.text.tertiary}
                  autoCapitalize="words"
                />
              </View>

              {/* Error Message */}
              {upiError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{upiError}</Text>
                </View>
              ) : null}

              {/* Help Text */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                  💡 Your UPI ID is required to collect payments. Find it in your payment app (Google Pay, PhonePe, Paytm, etc.)
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <OnboardingPagination
          total={4}
          currentIndex={currentIndex}
        />
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {isUpiScreen ? (
          <Pressable
            onPress={handleCompleteSetup}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Complete Setup</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Next</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  scrollView: {
    flex: 1,
  },
  screenContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing['2xl'],
  },
  illustrationContainer: {
    height: 340,
    width: 340,
    marginBottom: tokens.spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  onboardingLogo: {
    width: 300,
    height: 64,
    marginBottom: tokens.spacing.md,
  },
  title: {
    fontSize: tokens.typography.h1.fontSize,
    fontWeight: tokens.typography.h1.fontWeight,
    lineHeight: tokens.typography.h1.lineHeight,
    letterSpacing: tokens.typography.h1.letterSpacing,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontWeight: tokens.typography.bodyLarge.fontWeight,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  paginationContainer: {
    paddingVertical: tokens.spacing.xl,
  },
  actionContainer: {
    paddingHorizontal: tokens.spacing['2xl'],
    paddingBottom: tokens.spacing['2xl'],
  },
  primaryButton: {
    height: tokens.components.button.height.lg,
    backgroundColor: tokens.colors.amber[500],  // Amber for primary CTA
    borderRadius: tokens.components.button.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.md,
  },
  primaryButtonPressed: {
    opacity: tokens.animation.values.buttonPress.opacity,
    transform: [{ scale: tokens.animation.values.buttonPress.scale }],
  },
  primaryButtonText: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.inverse,
  },
  secondaryButton: {
    height: tokens.components.button.height.lg,
    backgroundColor: 'transparent',
    borderRadius: tokens.components.button.borderRadius,
    borderWidth: 2,
    borderColor: tokens.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    opacity: tokens.animation.values.buttonPress.opacity,
    backgroundColor: tokens.colors.background.subtle,
  },
  secondaryButtonText: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.brand.primary,
  },
  // UPI Setup Screen Styles
  upiHeaderContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing['2xl'],
  },
  upiEmoji: {
    fontSize: 80,
    marginBottom: tokens.spacing.lg,
  },
  upiFormContainer: {
    width: '100%',
    maxWidth: 320,
  },
  inputContainer: {
    marginBottom: tokens.spacing.lg,
  },
  inputLabel: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  input: {
    height: 56,
    backgroundColor: tokens.colors.background.base,
    borderWidth: 2,
    borderColor: tokens.colors.border.default,
    borderRadius: tokens.components.input.borderRadius,
    paddingHorizontal: tokens.spacing.md,
    fontSize: tokens.typography.bodyLarge.fontSize,
    color: tokens.colors.text.primary,
  },
  inputError: {
    borderColor: tokens.colors.error.main,
  },
  errorContainer: {
    backgroundColor: tokens.colors.error.light,
    borderRadius: radius.sm,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  errorText: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.error.dark,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  helpContainer: {
    backgroundColor: tokens.colors.background.subtle,
    borderRadius: radius.sm,
    padding: tokens.spacing.md,
  },
  helpText: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.colors.text.secondary,
  },
});
