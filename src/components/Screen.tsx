import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Background color for the safe area. Default: transparent (screen controls its own bg). */
  backgroundColor?: string;
};

export function Screen({ children, style, backgroundColor = "transparent" }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor },
        {
          paddingTop: Math.max(insets.top - 19, 0),
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
