/**
 * OnboardingIllustrations - Wrapper components for onboarding illustrations
 *
 * Provides individual illustration components for each onboarding screen
 * with consistent sizing and styling.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const ILLUSTRATION_SIZE = 280;

interface IllustrationProps {
  size?: number;
}

export const WelcomeIllustration: React.FC<IllustrationProps> = ({
  size = ILLUSTRATION_SIZE
}) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../../assets/illustrations/welcome.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
);

export const BillSplittingIllustration: React.FC<IllustrationProps> = ({
  size = ILLUSTRATION_SIZE
}) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../../assets/illustrations/bill-splitting.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
);

export const FriendGroupsIllustration: React.FC<IllustrationProps> = ({
  size = ILLUSTRATION_SIZE
}) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../../assets/illustrations/friend-groups.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
);

export const SettlementTrackingIllustration: React.FC<IllustrationProps> = ({
  size = ILLUSTRATION_SIZE
}) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../../assets/illustrations/settlement-tracking.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
);

export const PrivacySecurityIllustration: React.FC<IllustrationProps> = ({
  size = ILLUSTRATION_SIZE
}) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../../assets/illustrations/privacy-security.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
);

export const ReadyToStartIllustration: React.FC<IllustrationProps> = ({
  size = ILLUSTRATION_SIZE
}) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../../assets/illustrations/ready-to-start.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
  },
});
