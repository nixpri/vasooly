import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle, LayoutChangeEvent } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  BlurMask,
  Shadow,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animate?: boolean;
  borderRadius?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  animate = false,
  borderRadius = 16,
}) => {
  const scale = useSharedValue(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  React.useEffect(() => {
    if (animate) {
      scale.value = withSpring(1.02, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [animate]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  return (
    <Animated.View
      style={[styles.container, style, animatedStyle]}
      onLayout={handleLayout}
    >
      {/* Skia Canvas for Glass Effect */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Background blur effect - Earthen Light Mode */}
          <RoundedRect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            r={borderRadius}
            color="rgba(245, 243, 240, 0.98)"
          >
            <BlurMask blur={8} style="normal" />
            <Shadow dx={0} dy={2} blur={6} color="rgba(62, 39, 35, 0.06)" />
          </RoundedRect>

          {/* Subtle warm gradient overlay */}
          <RoundedRect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            r={borderRadius}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, dimensions.height)}
              colors={[
                'rgba(78, 52, 46, 0.015)',
                'rgba(78, 52, 46, 0.008)',
              ]}
            />
          </RoundedRect>

          {/* Warm border */}
          <RoundedRect
            x={1}
            y={1}
            width={dimensions.width - 2}
            height={dimensions.height - 2}
            r={borderRadius - 1}
            style="stroke"
            strokeWidth={1}
            color="rgba(232, 228, 223, 0.9)"
          />
        </Canvas>
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

// Glass Card with Moti animation entry
export const AnimatedGlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderRadius = 16,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.9,
        translateY: 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        translateY: 0,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 150,
        mass: 1,
      }}
    >
      <View style={[styles.container, style]} onLayout={handleLayout}>
        {/* Skia Canvas for Glass Effect */}
        {dimensions.width > 0 && dimensions.height > 0 && (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Background blur effect - Earthen Light Mode */}
            <RoundedRect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              r={borderRadius}
              color="rgba(245, 243, 240, 0.98)"
            >
              <BlurMask blur={8} style="normal" />
              <Shadow dx={0} dy={2} blur={6} color="rgba(62, 39, 35, 0.06)" />
            </RoundedRect>

            {/* Subtle warm gradient overlay */}
            <RoundedRect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              r={borderRadius}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, dimensions.height)}
                colors={[
                  'rgba(78, 52, 46, 0.015)',
                  'rgba(78, 52, 46, 0.008)',
                ]}
              />
            </RoundedRect>

            {/* Warm border */}
            <RoundedRect
              x={1}
              y={1}
              width={dimensions.width - 2}
              height={dimensions.height - 2}
              r={borderRadius - 1}
              style="stroke"
              strokeWidth={1}
              color="rgba(232, 228, 223, 0.9)"
            />
          </Canvas>
        )}

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(250, 249, 247, 0.85)', // Earthen warm cream background (neutral 50)
  },
  content: {
    padding: 0,
  },
});
