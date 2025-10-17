import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { AnimatedGlassCard } from '../components/GlassCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { MotiView } from 'moti';

export const PerformancePOC: React.FC = () => {
  const [cardCount, setCardCount] = useState(3);

  // Floating animation for background element
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withSpring(-10, { damping: 15, stiffness: 50 }),
        withSpring(10, { damping: 15, stiffness: 50 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatY.value }],
    };
  });

  const handlePress = () => {
    // Trigger animation demonstration
    console.log('Animation triggered');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient orbs */}
      <Animated.View style={[styles.backgroundOrb1, floatingStyle]} />
      <Animated.View style={[styles.backgroundOrb2, floatingStyle]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
        >
          <Text style={styles.title}>Performance POC</Text>
          <Text style={styles.subtitle}>Skia Glass Effects + 60fps Animations</Text>
        </MotiView>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={styles.button}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>Trigger Animation</Text>
          </Pressable>

          <View style={styles.counterRow}>
            <Pressable
              style={styles.smallButton}
              onPress={() => setCardCount(Math.max(1, cardCount - 1))}
            >
              <Text style={styles.buttonText}>-</Text>
            </Pressable>
            <Text style={styles.counterText}>{cardCount} Cards</Text>
            <Pressable
              style={styles.smallButton}
              onPress={() => setCardCount(Math.min(10, cardCount + 1))}
            >
              <Text style={styles.buttonText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Glass Cards Demo */}
        <View style={styles.cardsContainer}>
          {Array.from({ length: cardCount }).map((_, index) => (
            <AnimatedGlassCard key={index} style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>Bill Split #{index + 1}</Text>
                <Text style={styles.cardAmount}>₹{(1000 * (index + 1)).toLocaleString('en-IN')}</Text>
                <Text style={styles.cardSubtext}>
                  {index + 2} participants • Equal split
                </Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>2 Paid • {index} Pending</Text>
                </View>
              </View>
            </AnimatedGlassCard>
          ))}
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Performance Target</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Target FPS:</Text>
            <Text style={styles.metricValue}>60 fps</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Frame Budget:</Text>
            <Text style={styles.metricValue}>16.67ms</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Animation Engine:</Text>
            <Text style={styles.metricValue}>Reanimated 4 Worklets</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Glass Effects:</Text>
            <Text style={styles.metricValue}>Skia Blur + Shadow</Text>
          </View>
        </View>

        {/* Testing Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>📱 Testing Checklist</Text>
          <Text style={styles.noteItem}>✓ Skia canvas renders glass effects</Text>
          <Text style={styles.noteItem}>✓ Reanimated spring animations smooth</Text>
          <Text style={styles.noteItem}>✓ Moti entry animations working</Text>
          <Text style={styles.noteItem}>✓ Multiple cards render without jank</Text>
          <Text style={styles.noteItem}>
            ⚠️ Test on physical mid-range device for real FPS
          </Text>
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
  },
  backgroundOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
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
  controls: {
    marginBottom: 32,
    gap: 16,
  },
  button: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  smallButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 100,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  card: {
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 12,
  },
  cardSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  notesContainer: {
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
});
