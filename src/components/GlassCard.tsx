import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
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
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  animate = false,
}) => {
  const scale = useSharedValue(1);

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

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {/* Skia Canvas for Glass Effect */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Background blur effect */}
        <RoundedRect
          x={0}
          y={0}
          width={350}
          height={200}
          r={24}
          color="rgba(255, 255, 255, 0.05)"
        >
          <BlurMask blur={20} style="normal" />
          <Shadow dx={0} dy={10} blur={30} color="rgba(0, 0, 0, 0.3)" />
        </RoundedRect>

        {/* Glass gradient overlay */}
        <RoundedRect x={0} y={0} width={350} height={200} r={24}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 200)}
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)']}
          />
        </RoundedRect>

        {/* Border glow */}
        <RoundedRect
          x={1}
          y={1}
          width={348}
          height={198}
          r={23}
          style="stroke"
          strokeWidth={1}
          color="rgba(255, 255, 255, 0.15)"
        >
          <BlurMask blur={4} style="solid" />
        </RoundedRect>
      </Canvas>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

// Glass Card with Moti animation entry
export const AnimatedGlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
}) => {
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
      <View style={[styles.container, style]}>
        {/* Skia Canvas for Glass Effect */}
        <Canvas style={StyleSheet.absoluteFill}>
          {/* Background blur effect */}
          <RoundedRect
            x={0}
            y={0}
            width={350}
            height={200}
            r={24}
            color="rgba(255, 255, 255, 0.05)"
          >
            <BlurMask blur={20} style="normal" />
            <Shadow dx={0} dy={10} blur={30} color="rgba(0, 0, 0, 0.3)" />
          </RoundedRect>

          {/* Glass gradient overlay */}
          <RoundedRect x={0} y={0} width={350} height={200} r={24}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, 200)}
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)']}
            />
          </RoundedRect>

          {/* Border glow */}
          <RoundedRect
            x={1}
            y={1}
            width={348}
            height={198}
            r={23}
            style="stroke"
            strokeWidth={1}
            color="rgba(255, 255, 255, 0.15)"
          >
            <BlurMask blur={4} style="solid" />
          </RoundedRect>
        </Canvas>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 30, 0.6)',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
});
