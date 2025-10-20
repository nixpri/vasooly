# Vasooly Animation Specifications

**Purpose**: Reanimated 3 animation patterns for all interactive components
**Framework**: react-native-reanimated v3
**Performance Target**: 60 FPS on all animations
**Last Updated**: 2025-10-20

---

## Table of Contents

1. [Animation System Overview](#animation-system-overview)
2. [Core Animation Patterns](#core-animation-patterns)
3. [Component-Specific Animations](#component-specific-animations)
4. [Haptic Feedback Integration](#haptic-feedback-integration)
5. [Performance Guidelines](#performance-guidelines)
6. [Animation Library](#animation-library)

---

## Animation System Overview

### Design Principles

**60 FPS Performance**: All animations run on UI thread using Reanimated worklets
**Responsive Feel**: Quick feedback on user interactions (150ms or less)
**Smooth Transitions**: Natural motion with spring physics
**Accessible**: Respect reduced motion preferences
**Consistent**: Use design token timing and spring configs

### Animation Philosophy

**Purposeful Motion**: Every animation serves a purpose
- **Feedback**: Confirm user actions (button presses, toggles)
- **Attention**: Direct focus to important elements (new items, errors)
- **Relationships**: Show connections and hierarchy (parent-child, cause-effect)
- **Continuity**: Maintain context during transitions (screen changes)

**Natural Physics**: Use spring-based animations for organic feel
**Subtle Defaults**: Animations enhance, not distract
**Progressive Enhancement**: Core functionality works without animations

---

## Core Animation Patterns

### 1. Entry Animations

**Purpose**: Gracefully introduce new elements to the screen

#### FadeIn

**Use Cases**: General purpose entry, low emphasis elements
**Duration**: 250ms (standard)

```typescript
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { tokens } from '@/theme/tokens';

const FadeIn = () => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, {
      duration: tokens.animations.timing.standard,
    }),
  }));

  return animatedStyle;
};

// Usage
const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withTiming(1, {
    duration: tokens.animations.timing.standard,
  });
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));
```

#### FadeInDown

**Use Cases**: Cards, list items, primary content
**Duration**: 400ms with spring
**Motion**: Fade + translate down 20px

```typescript
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { tokens } from '@/theme/tokens';

const useFadeInDown = (delay = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: tokens.animations.timing.standard,
      });
      translateY.value = withSpring(0, tokens.animations.spring.gentle);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

// Usage
<Animated.View style={useFadeInDown(100)}>
  <BalanceCard />
</Animated.View>
```

#### FadeInUp

**Use Cases**: Bottom sheets, toasts, action buttons
**Duration**: 300ms with spring
**Motion**: Fade + translate up 20px

```typescript
const useFadeInUp = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: tokens.animations.timing.standard,
    });
    translateY.value = withSpring(0, tokens.animations.spring.gentle);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};
```

#### SlideInRight

**Use Cases**: Screen transitions, new transactions, navigation
**Duration**: 350ms with spring
**Motion**: Slide from right edge

```typescript
const useSlideInRight = () => {
  const translateX = useSharedValue(300);  // Start off-screen

  useEffect(() => {
    translateX.value = withSpring(0, tokens.animations.spring.smooth);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return animatedStyle;
};
```

#### ScaleIn

**Use Cases**: Modals, emphasis, celebration states
**Duration**: 250ms with bouncy spring
**Motion**: Scale from 0.9 to 1.0

```typescript
const useScaleIn = () => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, tokens.animations.spring.bouncy);
    opacity.value = withTiming(1, {
      duration: tokens.animations.timing.quick,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};
```

#### Stagger Animation

**Use Cases**: List items, sequential reveals
**Delay**: 50-100ms between items

```typescript
const useStaggeredFadeIn = (index: number, itemCount: number) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  const delay = index * 50;  // 50ms stagger

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: tokens.animations.timing.standard,
      });
      translateY.value = withSpring(0, tokens.animations.spring.gentle);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

// Usage in FlatList
<FlatList
  data={transactions}
  renderItem={({ item, index }) => (
    <Animated.View style={useStaggeredFadeIn(index, transactions.length)}>
      <TransactionCard transaction={item} />
    </Animated.View>
  )}
/>
```

---

### 2. Exit Animations

**Purpose**: Gracefully remove elements from screen

#### FadeOut

**Use Cases**: Dismissing toasts, hiding elements
**Duration**: 200ms (quick)

```typescript
const useFadeOut = (onComplete?: () => void) => {
  const opacity = useSharedValue(1);

  const fadeOut = () => {
    opacity.value = withTiming(0, {
      duration: tokens.animations.timing.quick,
    }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { animatedStyle, fadeOut };
};
```

#### SlideOutRight

**Use Cases**: Swipe to dismiss, screen transitions
**Duration**: 300ms

```typescript
const useSlideOutRight = (onComplete?: () => void) => {
  const translateX = useSharedValue(0);

  const slideOut = () => {
    translateX.value = withTiming(300, {
      duration: 300,
    }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { animatedStyle, slideOut };
};
```

---

### 3. Interactive State Animations

**Purpose**: Provide immediate feedback on user interactions

#### Button Press

**Effect**: Scale down slightly + reduce opacity
**Duration**: 150ms (quick)
**Spring**: Snappy

```typescript
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { tokens } from '@/theme/tokens';

const useButtonAnimation = ({ haptic = false, hapticIntensity = 'light' }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    'worklet';
    scale.value = withTiming(0.95, {
      duration: tokens.animations.timing.quick,
    });
    opacity.value = withTiming(0.8, {
      duration: tokens.animations.timing.quick,
    });

    if (haptic) {
      runOnJS(triggerHaptic)(hapticIntensity);
    }
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, tokens.animations.spring.snappy);
    opacity.value = withTiming(1, {
      duration: tokens.animations.timing.quick,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle, handlePressIn, handlePressOut };
};

// Usage (already implemented in AnimatedButton component)
export const AnimatedButton = ({ onPress, children, haptic, hapticIntensity, style }) => {
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonAnimation({
    haptic,
    hapticIntensity,
  });

  return (
    <AnimatedTouchable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      {children}
    </AnimatedTouchable>
  );
};
```

#### Card Press

**Effect**: Subtle scale reduction + shadow reduction
**Duration**: 150ms
**Spring**: Gentle

```typescript
const useCardPress = () => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    'worklet';
    scale.value = withTiming(0.98, {
      duration: tokens.animations.timing.quick,
    });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, tokens.animations.spring.gentle);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, handlePressIn, handlePressOut };
};

// Usage in TransactionCard
<AnimatedTouchable
  style={[styles.card, animatedStyle]}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  onPress={onPress}
>
  <TransactionContent />
</AnimatedTouchable>
```

#### Toggle/Switch Animation

**Effect**: Smooth slide + color transition
**Duration**: 200ms
**Spring**: Snappy

```typescript
const useToggleAnimation = (isOn: boolean) => {
  const translateX = useSharedValue(isOn ? 20 : 0);
  const backgroundColor = useSharedValue(
    isOn ? tokens.colors.financial.positive : tokens.colors.border.default
  );

  useEffect(() => {
    translateX.value = withSpring(isOn ? 20 : 0, tokens.animations.spring.snappy);
    backgroundColor.value = withTiming(
      isOn ? tokens.colors.financial.positive : tokens.colors.border.default,
      { duration: tokens.animations.timing.standard }
    );
  }, [isOn]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  return { thumbStyle, trackStyle };
};
```

#### Checkbox Animation

**Effect**: Scale + checkmark draw
**Duration**: 250ms
**Spring**: Bouncy

```typescript
const useCheckboxAnimation = (checked: boolean) => {
  const scale = useSharedValue(checked ? 1 : 0);
  const checkProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    if (checked) {
      scale.value = withSpring(1, tokens.animations.spring.bouncy);
      checkProgress.value = withTiming(1, {
        duration: tokens.animations.timing.standard,
      });
    } else {
      scale.value = withTiming(0, {
        duration: tokens.animations.timing.quick,
      });
      checkProgress.value = withTiming(0, {
        duration: tokens.animations.timing.quick,
      });
    }
  }, [checked]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    strokeDashoffset: (1 - checkProgress.value) * 100,  // Animated checkmark path
  }));

  return { containerStyle, checkStyle };
};
```

---

### 4. Progress Animations

**Purpose**: Visual feedback for ongoing processes

#### Progress Bar Fill

**Effect**: Animated width with spring
**Duration**: Spring-based (smooth)

```typescript
const useProgressAnimation = (progress: number) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, tokens.animations.spring.smooth);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return animatedStyle;
};

// Usage in ProgressBar component
export const ProgressBar = ({ progress, variant = 'default' }) => {
  const animatedStyle = useProgressAnimation(progress);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.fill,
          variant === 'success' && styles.fillSuccess,
          animatedStyle,
        ]}
      />
    </View>
  );
};
```

#### Number Counter

**Effect**: Animated number counting
**Duration**: 400ms

```typescript
const useNumberCounter = (targetValue: number) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(targetValue, {
      duration: tokens.animations.timing.slow,
    });
  }, [targetValue]);

  const animatedProps = useAnimatedProps(() => ({
    text: `$${animatedValue.value.toFixed(2)}`,
  }));

  return animatedProps;
};

// Usage
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

<AnimatedTextInput
  animatedProps={useNumberCounter(balanceAmount)}
  editable={false}
  style={styles.balanceText}
/>
```

#### Loading Spinner

**Effect**: Continuous rotation
**Duration**: 1000ms loop

```typescript
const useSpinnerAnimation = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1  // Infinite repeat
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return animatedStyle;
};

// Usage in LoadingSpinner
export const LoadingSpinner = ({ size = 24, color = tokens.colors.brand.primary }) => {
  const animatedStyle = useSpinnerAnimation();

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};
```

#### Shimmer/Skeleton Loading

**Effect**: Moving gradient shimmer
**Duration**: 1500ms loop

```typescript
const useShimmerAnimation = () => {
  const translateX = useSharedValue(-300);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(300, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return animatedStyle;
};

// Usage
export const SkeletonLoader = ({ width, height }) => {
  const animatedStyle = useShimmerAnimation();

  return (
    <View style={[styles.skeleton, { width, height }]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: tokens.colors.border.light,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '100%',
    backgroundColor: tokens.colors.background.elevated,
    opacity: 0.5,
  },
});
```

---

### 5. Micro-Interactions

**Purpose**: Delightful small animations enhancing usability

#### Haptic Feedback Trigger

**Integration**: Works with animations for multi-sensory feedback

```typescript
import * as Haptics from 'expo-haptics';

export const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  switch (intensity) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
};

// Usage with animation
const handleSuccess = () => {
  scale.value = withSpring(1.05, tokens.animations.spring.bouncy, () => {
    runOnJS(triggerHaptic)('success');
    scale.value = withSpring(1, tokens.animations.spring.gentle);
  });
};
```

#### Wiggle/Shake (Error Feedback)

**Effect**: Horizontal shake
**Duration**: 300ms
**Use Case**: Invalid input, error states

```typescript
const useWiggleAnimation = () => {
  const translateX = useSharedValue(0);

  const wiggle = () => {
    'worklet';
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    runOnJS(triggerHaptic)('error');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { animatedStyle, wiggle };
};

// Usage
const { animatedStyle, wiggle } = useWiggleAnimation();

const handleInvalidInput = () => {
  wiggle();
};
```

#### Pulse Animation

**Effect**: Subtle scale pulse
**Duration**: 1000ms loop
**Use Case**: Attention-grabbing (notifications, new items)

```typescript
const usePulseAnimation = (shouldPulse: boolean = true) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shouldPulse) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05, tokens.animations.spring.gentle),
          withSpring(1, tokens.animations.spring.gentle)
        ),
        -1,  // Infinite
        false  // Don't reverse
      );
    } else {
      scale.value = withSpring(1, tokens.animations.spring.gentle);
    }
  }, [shouldPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};
```

#### Float Animation

**Effect**: Gentle vertical floating
**Duration**: 2000ms loop
**Use Case**: Empty state illustrations, decorative elements

```typescript
const useFloatAnimation = () => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withSpring(-5, { ...tokens.animations.spring.gentle, duration: 2000 }),
        withSpring(5, { ...tokens.animations.spring.gentle, duration: 2000 })
      ),
      -1,
      true  // Reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};
```

---

### 6. Celebration Animations

**Purpose**: Reward user achievements with delightful animations

#### Confetti Burst

**Effect**: Particle explosion
**Duration**: 2000ms
**Use Case**: All bills settled, major milestones

```typescript
const useConfettiAnimation = (trigger: boolean) => {
  const particles = Array.from({ length: 20 }, () => ({
    x: useSharedValue(0),
    y: useSharedValue(0),
    rotation: useSharedValue(0),
    opacity: useSharedValue(0),
  }));

  useEffect(() => {
    if (trigger) {
      particles.forEach((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;

        particle.opacity.value = withTiming(1, { duration: 100 });
        particle.x.value = withSpring(Math.cos(angle) * distance, {
          ...tokens.animations.spring.bouncy,
          velocity: 20,
        });
        particle.y.value = withSpring(Math.sin(angle) * distance, {
          ...tokens.animations.spring.bouncy,
          velocity: 20,
        });
        particle.rotation.value = withTiming(360 * 3, { duration: 2000 });

        // Fade out
        setTimeout(() => {
          particle.opacity.value = withTiming(0, { duration: 300 });
        }, 1500);
      });
    }
  }, [trigger]);

  return particles;
};
```

#### Success Checkmark

**Effect**: Checkmark draw animation
**Duration**: 400ms
**Use Case**: First bill created, payment completed

```typescript
const useCheckmarkAnimation = (show: boolean) => {
  const scale = useSharedValue(0);
  const checkProgress = useSharedValue(0);

  useEffect(() => {
    if (show) {
      scale.value = withSequence(
        withSpring(1.2, tokens.animations.spring.bouncy),
        withSpring(1, tokens.animations.spring.gentle)
      );
      checkProgress.value = withTiming(1, {
        duration: tokens.animations.timing.slow,
      });

      runOnJS(triggerHaptic)('success');
    }
  }, [show]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pathStyle = useAnimatedProps(() => ({
    strokeDashoffset: (1 - checkProgress.value) * 100,
  }));

  return { containerStyle, pathStyle };
};
```

#### Bounce Celebration

**Effect**: Exaggerated bounce with overshoot
**Duration**: 600ms
**Use Case**: Friend added, settlement confirmed

```typescript
const useCelebrationBounce = (trigger: boolean) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (trigger) {
      scale.value = withSequence(
        withSpring(1.3, {
          ...tokens.animations.spring.bouncy,
          overshootClamping: false,
        }),
        withSpring(1, tokens.animations.spring.gentle)
      );

      runOnJS(triggerHaptic)('success');
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};
```

---

## Component-Specific Animations

### BalanceCard

**Entry**: FadeInDown from top (400ms)
**Amount Update**: Number counter (400ms)
**Button Press**: Scale 0.95 + haptic medium

```typescript
export const BalanceCard = ({ owedTo, owedBy, onSettleUp }) => {
  const entryStyle = useFadeInDown(0);
  const owedToProps = useNumberCounter(owedTo);
  const owedByProps = useNumberCounter(owedBy);

  return (
    <Animated.View style={[styles.container, entryStyle]}>
      <GlassCard>
        <Text style={styles.title}>YOUR BALANCE</Text>

        <View style={styles.amountRow}>
          <Text style={styles.label}>You're owed</Text>
          <AnimatedTextInput
            animatedProps={owedToProps}
            style={styles.amountPositive}
            editable={false}
          />
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.label}>You owe</Text>
          <AnimatedTextInput
            animatedProps={owedByProps}
            style={styles.amountNegative}
            editable={false}
          />
        </View>

        <AnimatedButton
          onPress={onSettleUp}
          haptic
          hapticIntensity="medium"
          style={styles.settleButton}
        >
          <Text style={styles.buttonText}>Settle Up</Text>
        </AnimatedButton>
      </GlassCard>
    </Animated.View>
  );
};
```

### TransactionCard

**Entry**: FadeIn + SlideInRight (staggered in lists)
**Press**: Scale 0.98 + haptic light
**Status Change**: Pulse on badge

```typescript
export const TransactionCard = ({ transaction, index, onPress }) => {
  const entryStyle = useStaggeredFadeIn(index, 10);
  const { animatedStyle, handlePressIn, handlePressOut } = useCardPress();

  const pulseStyle = usePulseAnimation(transaction.status === 'pending');

  return (
    <Animated.View style={entryStyle}>
      <AnimatedTouchable
        style={[styles.card, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <GlassCard>
          <Text style={styles.title}>{transaction.title}</Text>
          <Text style={styles.metadata}>
            Added by {transaction.paidBy} • {formatDate(transaction.timestamp)}
          </Text>

          <View style={styles.amountRow}>
            <Text>Your share</Text>
            <Text style={styles.amount}>${transaction.yourShare}</Text>
          </View>

          <Animated.View style={pulseStyle}>
            <StatusBadge status={transaction.status} />
          </Animated.View>
        </GlassCard>
      </AnimatedTouchable>
    </Animated.View>
  );
};
```

### StatusBadge

**Status Change**: CrossFade (200ms)
**Entry**: FadeIn (150ms)

```typescript
export const StatusBadge = ({ status }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 200 });
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.badge, styles[status], animatedStyle]}>
      <Text style={styles.text}>{status.toUpperCase()}</Text>
    </Animated.View>
  );
};
```

### ProgressBar

**Fill Animation**: Spring-based width (smooth)
**Color Transition**: When variant changes (400ms)

```typescript
export const ProgressBar = ({ progress, variant = 'default' }) => {
  const width = useSharedValue(0);
  const backgroundColor = useSharedValue(
    variant === 'success'
      ? tokens.colors.financial.settled
      : tokens.colors.brand.primary
  );

  useEffect(() => {
    width.value = withSpring(progress, tokens.animations.spring.smooth);
  }, [progress]);

  useEffect(() => {
    backgroundColor.value = withTiming(
      variant === 'success'
        ? tokens.colors.financial.settled
        : tokens.colors.brand.primary,
      { duration: tokens.animations.timing.slow }
    );
  }, [variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: backgroundColor.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
};
```

### Avatar

**Image Load**: FadeIn (300ms)
**Press**: Scale 0.95 (if pressable)

```typescript
export const Avatar = ({ imageUrl, name, size = 'medium', onPress }) => {
  const imageOpacity = useSharedValue(0);
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonAnimation({
    haptic: !!onPress,
    hapticIntensity: 'light',
  });

  const handleImageLoad = () => {
    imageOpacity.value = withTiming(1, { duration: 300 });
  };

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const Container = onPress ? AnimatedTouchable : Animated.View;

  return (
    <Container
      style={[styles.container, animatedStyle]}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress}
    >
      {imageUrl ? (
        <Animated.Image
          source={{ uri: imageUrl }}
          style={[styles.image, imageStyle]}
          onLoad={handleImageLoad}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.initials}>{getInitials(name)}</Text>
        </View>
      )}
    </Container>
  );
};
```

### EmptyState

**Entry**: FadeInUp (300ms with gentle spring)
**Illustration**: Optional float animation

```typescript
export const EmptyState = ({ illustration, title, description, primaryAction }) => {
  const entryStyle = useFadeInUp();
  const floatStyle = useFloatAnimation();

  return (
    <Animated.View style={[styles.container, entryStyle]}>
      <Animated.View style={[styles.illustrationContainer, floatStyle]}>
        {illustration}
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {primaryAction && (
        <AnimatedButton
          onPress={primaryAction.onPress}
          haptic
          hapticIntensity="medium"
          style={styles.primaryButton}
        >
          <Text style={styles.buttonText}>{primaryAction.label}</Text>
        </AnimatedButton>
      )}
    </Animated.View>
  );
};
```

### BottomSheet

**Entry**: SlideInUp with backdrop fade (300ms)
**Exit**: SlideOutDown with backdrop fade (250ms)
**Gesture**: Pan gesture for dismissal

```typescript
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export const BottomSheet = ({ visible, onClose, children, title, heightMode = 'auto' }) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const snapPoints = useMemo(() => {
    switch (heightMode) {
      case 'half': return ['50%'];
      case 'full': return ['90%'];
      default: return ['auto'];
    }
  }, [heightMode]);

  return (
    <>
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        animateOnMount={true}
      >
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </BottomSheetModal>
    </>
  );
};
```

---

## Haptic Feedback Integration

### When to Use Haptics

| Interaction | Haptic Type | Timing |
|-------------|-------------|--------|
| Button press | Medium | On press down |
| Toggle switch | Light | On state change |
| Checkbox | Light | On toggle |
| Delete action | Heavy | On confirm |
| Success (bill created) | Success | On completion |
| Error (invalid input) | Error | On validation fail |
| Warning (pending action) | Warning | On warning appear |
| List item selection | Light | On selection |
| Swipe action | Medium | On threshold |

### Implementation Pattern

```typescript
// Combine animation + haptic
const handleConfirmation = () => {
  // Visual feedback
  scale.value = withSequence(
    withSpring(1.1, tokens.animations.spring.bouncy),
    withSpring(1, tokens.animations.spring.gentle)
  );

  // Haptic feedback
  runOnJS(triggerHaptic)('success');

  // Execute action
  runOnJS(onConfirm)();
};
```

---

## Performance Guidelines

### Best Practices

**1. Use Worklets**: All animation logic should use 'worklet' directive
```typescript
const handlePress = () => {
  'worklet';  // Runs on UI thread
  scale.value = withSpring(0.95);
};
```

**2. Avoid Re-Renders**: Use `useAnimatedStyle` instead of state
```typescript
// ❌ Bad: Causes re-render
const [scale, setScale] = useState(1);

// ✅ Good: No re-render
const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

**3. Memoize Callbacks**: Prevent recreation on each render
```typescript
const handlePress = useCallback(() => {
  scale.value = withSpring(0.95);
}, []);
```

**4. Limit Concurrent Animations**: Max 10-15 simultaneous animations
```typescript
// Stagger list animations instead of all at once
const delay = index * 50;  // 50ms between items
```

**5. Use `runOnJS` for Side Effects**: JS thread operations
```typescript
scale.value = withSpring(1, {}, (finished) => {
  if (finished) {
    runOnJS(onComplete)();  // Callback on JS thread
  }
});
```

### Performance Monitoring

```typescript
// Log frame drops (development only)
if (__DEV__) {
  InteractionManager.runAfterInteractions(() => {
    console.log('Animation complete - checking for frame drops');
  });
}
```

### Reduced Motion Support

```typescript
import { useReducedMotion } from 'react-native-reanimated';

const AnimatedComponent = () => {
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      // Instant transition
      return { opacity: 1, transform: [{ scale: 1 }] };
    }

    // Normal animation
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
```

---

## Animation Library

### Reusable Animation Hooks

**File**: `src/hooks/useAnimations.ts`

```typescript
export { useFadeIn } from './animations/useFadeIn';
export { useFadeInDown } from './animations/useFadeInDown';
export { useFadeInUp } from './animations/useFadeInUp';
export { useSlideInRight } from './animations/useSlideInRight';
export { useScaleIn } from './animations/useScaleIn';
export { useStaggeredFadeIn } from './animations/useStaggeredFadeIn';
export { useButtonAnimation } from './animations/useButtonAnimation';
export { useCardPress } from './animations/useCardPress';
export { useProgressAnimation } from './animations/useProgressAnimation';
export { useNumberCounter } from './animations/useNumberCounter';
export { useSpinnerAnimation } from './animations/useSpinnerAnimation';
export { useShimmerAnimation } from './animations/useShimmerAnimation';
export { useWiggleAnimation } from './animations/useWiggleAnimation';
export { usePulseAnimation } from './animations/usePulseAnimation';
export { useFloatAnimation } from './animations/useFloatAnimation';
export { useCheckmarkAnimation } from './animations/useCheckmarkAnimation';
export { useCelebrationBounce } from './animations/useCelebrationBounce';
```

### Animation Utilities

**File**: `src/utils/animations.ts`

```typescript
import { tokens } from '@/theme/tokens';

// Spring presets (already in tokens, but exported for convenience)
export const springPresets = tokens.animations.spring;

// Timing presets
export const timingPresets = tokens.animations.timing;

// Common animation sequences
export const sequences = {
  bounce: (scale: Animated.SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(1.2, springPresets.bouncy),
      withSpring(1, springPresets.gentle)
    );
  },

  wiggle: (translateX: Animated.SharedValue<number>) => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  },
};

// Haptic feedback
export { triggerHaptic } from './haptics';
```

---

## Implementation Checklist

### Week 12: Core Animations
- [ ] Implement all entry animations (FadeIn, FadeInDown, FadeInUp, SlideInRight, ScaleIn)
- [ ] Implement button press animation (useButtonAnimation)
- [ ] Implement card press animation (useCardPress)
- [ ] Implement progress bar animation
- [ ] Implement number counter animation
- [ ] Implement loading spinner animation
- [ ] Integrate haptic feedback with AnimatedButton

### Week 13: Advanced Animations
- [ ] Implement staggered list animations
- [ ] Implement bottom sheet animations
- [ ] Implement toggle/switch animations
- [ ] Implement checkbox animations
- [ ] Implement shimmer/skeleton loading

### Week 14: Micro-Interactions
- [ ] Implement wiggle/shake error feedback
- [ ] Implement pulse animation for notifications
- [ ] Implement float animation for empty states
- [ ] Celebration animations (confetti, checkmark, bounce)

### Week 15: Polish
- [ ] Add reduced motion support to all components
- [ ] Performance optimization (limit concurrent animations)
- [ ] Refine timing and spring values
- [ ] Add animation documentation to components

### Week 16: Testing
- [ ] Test all animations at 60 FPS
- [ ] Test on low-end devices
- [ ] Test reduced motion accessibility
- [ ] Verify haptic feedback on physical devices

---

**Status**: ✅ Complete
**Version**: 1.0
**Next Steps**: Implement animation hooks during Week 12-16
