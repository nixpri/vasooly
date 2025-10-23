/**
 * OnboardingScreen - Multi-step onboarding flow
 *
 * Introduces new users to Vasooly's core features through
 * 3 illustrated screens with swipe navigation.
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
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSettingsStore } from '@/stores';
import {
  OnboardingPagination,
  BillSplittingIllustration,
  SettlementTrackingIllustration,
  FriendGroupsIllustration,
} from '@/components';
import { tokens } from '@/theme/tokens';

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
  const { setOnboardingCompleted } = useSettingsStore();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted(true);
    onComplete();
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleGetStarted = async () => {
    await setOnboardingCompleted(true);
    onComplete();
  };

  const isLastScreen = currentIndex === ONBOARDING_SCREENS.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {!isLastScreen && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.skipContainer}
        >
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>
      )}

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
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <OnboardingPagination
          total={ONBOARDING_SCREENS.length}
          currentIndex={currentIndex}
        />
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {isLastScreen ? (
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
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
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: tokens.spacing.xl,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  skipText: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
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
});
