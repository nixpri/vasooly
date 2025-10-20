/**
 * OnboardingScreen - Multi-step onboarding flow
 *
 * Introduces new users to Vasooly's core features through
 * 6 illustrated screens with swipe navigation.
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
  WelcomeIllustration,
  BillSplittingIllustration,
  FriendGroupsIllustration,
  SettlementTrackingIllustration,
  PrivacySecurityIllustration,
  ReadyToStartIllustration,
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
  Illustration: React.FC;
}

const ONBOARDING_SCREENS: ScreenData[] = [
  {
    id: 0,
    title: 'Welcome to Vasooly',
    description: 'Split bills fairly, settle up easily',
    Illustration: WelcomeIllustration,
  },
  {
    id: 1,
    title: 'Split any expense',
    description: 'Meals, trips, rent, or utilities - divide costs fairly',
    Illustration: BillSplittingIllustration,
  },
  {
    id: 2,
    title: 'Organize by groups',
    description: 'Create groups for roommates, trips, or regular hangouts',
    Illustration: FriendGroupsIllustration,
  },
  {
    id: 3,
    title: 'Track balances easily',
    description: 'See who owes what, settle up with a tap',
    Illustration: SettlementTrackingIllustration,
  },
  {
    id: 4,
    title: 'Your data is private',
    description: 'End-to-end encryption keeps your expenses secure',
    Illustration: PrivacySecurityIllustration,
  },
  {
    id: 5,
    title: "You're all set!",
    description: 'Start splitting expenses with friends',
    Illustration: ReadyToStartIllustration,
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
                <screen.Illustration />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                {index === 0 ? (
                  <View style={styles.onboardingLogoRow}>
                    <Image
                      source={require('../../assets/vasooly-icon.png')}
                      style={styles.onboardingIcon}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../../assets/vasooly-text.png')}
                      style={styles.onboardingText}
                      resizeMode="contain"
                    />
                  </View>
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
    height: 280,
    width: 280,
    marginBottom: tokens.spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  onboardingLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: tokens.spacing.md,
  },
  onboardingIcon: {
    width: 64,
    height: 64,
  },
  onboardingText: {
    width: 240,
    height: 56,
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
