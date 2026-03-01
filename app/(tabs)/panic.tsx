import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";

type Phase = "select" | "intensity" | "timer" | "script" | "outcome";

type UrgeType = "checking" | "washing" | "counting" | "other";

const urgeTypes: { id: UrgeType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "checking", label: "Checking", icon: "eye-outline" },
  { id: "washing", label: "Washing", icon: "water-outline" },
  { id: "counting", label: "Counting", icon: "stats-chart-outline" },
  { id: "other", label: "Other", icon: "shield-outline" },
];

const acceptanceScripts = [
  "Notice this feeling and allow it to be here for a moment.",
  "You can choose how to respond to this urge, without rushing.",
  "Let the thought pass like a cloud in the sky.",
  "See if you can make room for this moment, even if it's hard.",
  "It's okay to feel uncomfortable and still move toward what matters.",
  "Remember a time you stayed with discomfort without acting on it.",
];

export default function PanicScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedUrge, setSelectedUrge] = useState<UrgeType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s - 1);
      }, 1000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }

    if (timerSeconds === 0) {
      setPhase("script");
      setTimerRunning(false);
    }
  }, [timerRunning, timerSeconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const resetFlow = () => {
    setPhase("select");
    setSelectedUrge(null);
    setIntensity(5);
    setTimerSeconds(120);
    setTimerRunning(false);
    setScriptIndex(0);
  };

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 4, 20),
            paddingBottom: Math.max(insets.bottom + 8, 32),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Calm Down 🌿</Text>
        <Text style={styles.subtitle}>
          You're doing great. Let's work through this together.
        </Text>

        {phase === "select" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of urge are you feeling?</Text>
            <View style={styles.urgeList}>
              {urgeTypes.map((urge) => (
                <Pressable
                  key={urge.id}
                  style={({ pressed }) => [styles.urgeButton, pressed && styles.urgeButtonPressed]}
                  onPress={() => {
                    setSelectedUrge(urge.id);
                    setPhase("intensity");
                  }}
                >
                  <Ionicons name={urge.icon} size={22} color={colors.accent} />
                  <Text style={styles.urgeLabel}>{urge.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {phase === "intensity" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How strong is this urge?</Text>
            <View style={styles.intensityRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const active = n <= intensity;
                const purpleScale: Record<number, string> = {
                  1:  "#DDD6FE",
                  2:  "#C4B5FD",
                  3:  "#A78BFA",
                  4:  "#8B5CF6",
                  5:  "#7C3AED",
                  6:  "#6D28D9",
                  7:  "#5B21B6",
                  8:  "#4C1D95",
                  9:  "#3B0764",
                  10: "#2E1065",
                };
                const backgroundColor = active ? purpleScale[n] : "#E5E7EB";
                const labelColor = active && n <= 2 ? "#6D28D9" : "#FFFFFF";

                return (
                  <Pressable
                    key={n}
                    style={[styles.intensityDot, { backgroundColor }]}
                    onPress={() => setIntensity(n)}
                  >
                    <Text style={[styles.intensityLabel, { color: labelColor }]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.intensityHint}>
              {intensity <= 3
                ? "You're safe. Take a gentle breath."
                : intensity <= 7
                ? "It's okay. You don't have to act on this."
                : "You're safe. This feeling will crest and fade."}
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                setPhase("timer");
                setTimerRunning(true);
              }}
            >
              <Text style={styles.primaryButtonText}>Start delay timer</Text>
            </Pressable>
          </View>
        )}

        {phase === "timer" && (
          <View style={[styles.section, styles.timerSection]}>
            <Text style={styles.timerHint}>Notice your breath while the timer runs.</Text>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
            </View>
            <View style={styles.timerButtonsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setTimerRunning(false);
                  setPhase("script");
                }}
              >
                <Text style={styles.secondaryButtonText}>I can't wait</Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  setTimerRunning(false);
                  setPhase("outcome");
                }}
              >
                <Text style={styles.primaryButtonText}>I stayed with it</Text>
              </Pressable>
            </View>
          </View>
        )}

        {phase === "script" && (
          <View style={styles.section}>
            <Text style={styles.scriptText}>
              "{acceptanceScripts[scriptIndex]}"
            </Text>
            <View style={styles.timerButtonsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setScriptIndex((i) => (i + 1) % acceptanceScripts.length)}
              >
                <Text style={styles.secondaryButtonText}>Next thought</Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={() => setPhase("outcome")}
              >
                <Text style={styles.primaryButtonText}>Move on</Text>
              </Pressable>
            </View>
          </View>
        )}

        {phase === "outcome" && (
          <View style={[styles.section, styles.outcomeSection]}>
            <Text style={styles.outcomeEmoji}>✨</Text>
            <Text style={styles.outcomeTitle}>You stayed with a hard moment.</Text>
            <Text style={styles.outcomeText}>
              Each time you pause like this, you build a little more space between urges and
              actions.
            </Text>
            <View style={styles.xpChip}>
              <Text style={styles.xpChipText}>+10 XP</Text>
            </View>
            <Pressable style={styles.primaryButton} onPress={resetFlow}>
              <Text style={styles.primaryButtonText}>Back to cat</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: -8,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginTop: 4,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  urgeList: {
    gap: 12,
  },
  urgeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  urgeButtonPressed: {
    opacity: 0.85,
  },
  urgeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  intensityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  intensityDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  intensityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  intensityHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  primaryButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  timerSection: {
    alignItems: "center",
    gap: 16,
  },
  timerHint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  timerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  scriptText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  outcomeSection: {
    alignItems: "center",
    gap: 12,
  },
  outcomeEmoji: {
    fontSize: 40,
  },
  outcomeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  outcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  xpChip: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  xpChipText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600",
  },
});
