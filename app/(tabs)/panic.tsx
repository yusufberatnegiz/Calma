import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../src/components/Screen";
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
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Calm Space</Text>
        <Text style={styles.subtitle}>
          You're in a place to pause and notice urges, one step at a time.
        </Text>

        {phase === "select" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of urge is here?</Text>
            <View style={styles.urgeList}>
              {urgeTypes.map((urge) => {
                const Icon = Ionicons;
                const isSelected = selectedUrge === urge.id;
                return (
                  <Pressable
                    key={urge.id}
                    style={[styles.urgeButton, isSelected && styles.urgeButtonSelected]}
                    onPress={() => {
                      setSelectedUrge(urge.id);
                      setPhase("intensity");
                    }}
                  >
                    <Icon
                      name={urge.icon}
                      size={20}
                      color={isSelected ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.urgeLabel,
                        isSelected && { color: colors.textPrimary, fontWeight: "600" },
                      ]}
                    >
                      {urge.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {phase === "intensity" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How strong is this urge?</Text>
            <View style={styles.intensityRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const active = n <= intensity;
                let backgroundColor = colors.muted;
                if (active && n <= 3) backgroundColor = colors.accent;
                else if (active && n <= 6) backgroundColor = colors.textPrimary;
                else if (active) backgroundColor = colors.textSecondary;

                return (
                  <Pressable
                    key={n}
                    style={[
                      styles.intensityDot,
                      active && { backgroundColor },
                      !active && { backgroundColor: "#E5E7EB" },
                    ]}
                    onPress={() => setIntensity(n)}
                  >
                    <Text
                      style={[
                        styles.intensityLabel,
                        active && { color: "#FFFFFF" },
                      ]}
                    >
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.intensityHint}>
              {intensity <= 3 ? "Mild" : intensity <= 6 ? "Moderate" : "Strong"} — see if you can
              stay with it for a moment.
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
              “{acceptanceScripts[scriptIndex]}”
            </Text>
            <View style={styles.timerButtonsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  setScriptIndex((i) => (i + 1) % acceptanceScripts.length)
                }
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 12,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  urgeList: {
    gap: 8,
  },
  urgeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  urgeButtonSelected: {
    borderColor: colors.accent,
  },
  urgeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
    paddingVertical: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
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

