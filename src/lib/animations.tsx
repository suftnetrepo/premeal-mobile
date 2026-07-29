import { useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { StyledPressable } from "fluent-styles";
import { COLORS } from "../theme/colors";

// ─── Shared elevation presets — every elevated surface across the app uses
// one of these instead of a border. ─────────────────────────────────────────
export const SHADOW_SOFT = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};
export const SHADOW_CARD = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.09,
  shadowRadius: 22,
  elevation: 5,
};
export const SHADOW_CTA = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.32,
  shadowRadius: 12,
  elevation: 4,
};

// ─── Small press-scale wrapper — shared button/card feedback ──────────────────
export function ScalePressable({
  onPress,
  children,
  style,
  toValue = 0.96,
  disabled,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
  toValue?: number;
  disabled?: boolean;
}) {
  const anim = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.timing(anim, {
      toValue,
      duration: 90,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }
  function pressOut() {
    Animated.spring(anim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
      <StyledPressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
      >
        {children}
      </StyledPressable>
    </Animated.View>
  );
}

// ─── Fade-up mount animation ───────────────────────────────────────────────────
export function useFadeUp(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  useState(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  });
  return {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  };
}

// ─── Image that fades + scales in once loaded, instead of a blank flash ───────
export function FadeImage({
  uri,
  height,
  borderRadius,
}: {
  uri: string;
  height: number;
  borderRadius?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  function onLoad() {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View
      style={{
        height,
        borderRadius,
        overflow: "hidden",
        backgroundColor: COLORS.bgMuted,
      }}
    >
      <Animated.Image
        source={{ uri }}
        onLoad={onLoad}
        resizeMode="cover"
        style={{
          width: "100%",
          height: "100%",
          opacity: anim,
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.06, 1] }) },
          ],
        }}
      />
    </Animated.View>
  );
}

// ─── Spring pulse — used when a selectable chip becomes selected ──────────────
export function useSelectPulse(selected: boolean) {
  const anim = useRef(new Animated.Value(1)).current;
  const wasSelected = useRef(selected);

  if (wasSelected.current !== selected) {
    wasSelected.current = selected;
    if (selected) {
      anim.setValue(0.92);
      Animated.spring(anim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    }
  }

  return { transform: [{ scale: anim }] };
}
