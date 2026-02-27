import React from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="pet"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: "Nunito_600SemiBold",
          fontSize: 11,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = size ?? 22;

          switch (route.name) {
            case "pet":
              return <Ionicons name="home" size={iconSize} color={color} />;
            case "panic":
              return <Ionicons name="alert-circle-outline" size={iconSize} color={color} />;
            case "log":
              return <Ionicons name="book-outline" size={iconSize} color={color} />;
            case "tasks":
              return <Ionicons name="checkmark-done-outline" size={iconSize} color={color} />;
            default:
              return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
          }
        },
      })}
    >
      <Tabs.Screen name="pet" options={{ title: "Home" }} />
      <Tabs.Screen name="panic" options={{ title: "SOS" }} />
      <Tabs.Screen name="log" options={{ title: "Log" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
    </Tabs>
  );
}
