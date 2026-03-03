import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import { usePet } from "../../src/state/petStore";
import { XP_THRESHOLDS } from "../../src/domain/rewards";

export default function TabsLayout() {
  const { pet } = usePet();
  const canEvolve = pet.stage !== "royal" && pet.xp >= XP_THRESHOLDS[pet.stage];

  return (
    <Tabs
      initialRouteName="pet"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: "Nunito_600SemiBold",
          fontSize: 11,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = size ?? 22;

          if (route.name === "pet") {
            return (
              <View>
                <Ionicons name="home" size={iconSize} color={color} />
                {canEvolve && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -4,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.evolveGreen,
                      borderWidth: 1.5,
                      borderColor: "#FFFFFF",
                    }}
                  />
                )}
              </View>
            );
          }

          switch (route.name) {
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
