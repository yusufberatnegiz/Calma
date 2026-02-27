import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
          backgroundColor: colors.tabBar,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
        },
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
      <Tabs.Screen name="panic" options={{ title: "Calm" }} />
      <Tabs.Screen name="log" options={{ title: "Log" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
    </Tabs>
  );
}
