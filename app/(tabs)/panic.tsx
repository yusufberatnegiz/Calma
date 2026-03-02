import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { usePet } from "../../src/state/petStore";
import { useSessions, PanicOutcome } from "../../src/state/sessionStore";
import { XP_AWARDS, getTodayKey } from "../../src/domain/rewards";

type Phase =
  | "select"
  | "intensity"
  | "timer"
  | "script"
  | "outcome_choice"
  | "outcome";

type UrgeType = "checking" | "washing" | "counting" | "other";

const urgeTypes: {
  id: UrgeType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
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

const TIMER_TOTAL = 120;

export default function PanicScreen() {
  const insets = useSafeAreaInsets();
  const { dispatch: petDispatch } = usePet();
  const { dispatch: sessionDispatch } = useSessions();

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedUrge, setSelectedUrge] = useState<UrgeType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(TIMER_TOTAL);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [chosenOutcome, setChosenOutcome] = useState<PanicOutcome | null>(null);
  const [chosenXp, setChosenXp] = useState(0);

  // Single stable interval ref — never recreated each tick
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track session start time (set when entering timer phase)
  const sessionStartRef = useRef<number>(0);
  // Track seconds at timer-stop for duration calculation
  const timerSecondsRef = useRef(TIMER_TOTAL);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start timer when phase becomes "timer" — single effect, no timerSeconds dep
  useEffect(() => {
    if (phase !== "timer") return;

    sessionStartRef.current = Date.now();
    timerSecondsRef.current = TIMER_TOTAL;

    intervalRef.current = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          // Timer finished naturally — clear interval and advance phase
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          timerSecondsRef.current = 0;
          setPhase("script");
          return 0;
        }
        timerSecondsRef.current = s - 1;
        return s - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [phase]); // Only re-runs when phase changes — NOT every tick

  // Clean up on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleOutcomeChoice = (outcome: PanicOutcome) => {
    stopTimer();

    const xpAwarded =
      outcome === "resisted"
        ? XP_AWARDS.panic_resist
        : outcome === "partial"
          ? XP_AWARDS.panic_partial
          : XP_AWARDS.panic_compulsion;

    const durationSec = TIMER_TOTAL - timerSecondsRef.current;
    const endedAt = new Date().toISOString();
    const startedAt = new Date(sessionStartRef.current || Date.now()).toISOString();

    // Persist session
    sessionDispatch({
      type: "ADD_SESSION",
      session: {
        id: Date.now().toString(),
        startedAt,
        endedAt,
        durationSec,
        urgeRating: intensity,
        outcome,
        xpAwarded,
      },
    });

    // Update pet
    if (xpAwarded > 0) {
      petDispatch({ type: "ADD_XP", amount: xpAwarded });
    }
    if (outcome !== "compulsion") {
      petDispatch({ type: "RECORD_RESIST" });
    }
    petDispatch({ type: "MARK_ACTIVITY", dateKey: getTodayKey() });

    setChosenOutcome(outcome);
    setChosenXp(xpAwarded);
    setPhase("outcome");
  };

  const resetFlow = () => {
    stopTimer();
    setPhase("select");
    setSelectedUrge(null);
    setIntensity(5);
    setTimerSeconds(TIMER_TOTAL);
    timerSecondsRef.current = TIMER_TOTAL;
    setScriptIndex(0);
    setChosenOutcome(null);
    setChosenXp(0);
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
          Notice the urge. You can choose how to respond.
        </Text>

        {/* Phase: select urge type */}
        {phase === "select" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What kind of urge are you feeling?
            </Text>
            <View style={styles.urgeList}>
              {urgeTypes.map((urge) => (
                <Pressable
                  key={urge.id}
                  style={({ pressed }) => [
                    styles.urgeButton,
                    pressed && styles.urgeButtonPressed,
                  ]}
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

        {/* Phase: rate intensity */}
        {phase === "intensity" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How strong is this urge?</Text>
            <View style={styles.intensityRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const active = n <= intensity;
                const groupColor =
                  n <= 3 ? "#C084FC" : n <= 7 ? "#7C3AED" : "#3B0764";
                const backgroundColor = active ? groupColor : "#E5E7EB";
                const labelColor =
                  active && n <= 3 ? "#6D28D9" : active ? "#FFFFFF" : colors.textSecondary;

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
            {/* No reassurance — acceptance language only */}
            <Text style={styles.intensityHint}>
              {intensity <= 3
                ? "Notice this feeling. It will pass on its own."
                : intensity <= 7
                  ? "You can sit with this urge without acting on it."
                  : "This is hard. You don't have to do anything right now."}
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                setTimerSeconds(TIMER_TOTAL);
                timerSecondsRef.current = TIMER_TOTAL;
                setPhase("timer");
              }}
            >
              <Text style={styles.primaryButtonText}>Start delay timer</Text>
            </Pressable>
          </View>
        )}

        {/* Phase: countdown timer */}
        {phase === "timer" && (
          <View style={[styles.section, styles.timerSection]}>
            <Text style={styles.timerHint}>
              Notice your breath while the timer runs.
            </Text>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
            </View>
            <View style={styles.timerButtonsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  stopTimer();
                  setPhase("script");
                }}
              >
                <Text style={styles.secondaryButtonText}>I can't wait</Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  stopTimer();
                  setPhase("outcome_choice");
                }}
              >
                <Text style={styles.primaryButtonText}>I stayed with it</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Phase: acceptance script */}
        {phase === "script" && (
          <View style={styles.section}>
            <Text style={styles.scriptText}>
              "{acceptanceScripts[scriptIndex]}"
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
                onPress={() => setPhase("outcome_choice")}
              >
                <Text style={styles.primaryButtonText}>Move on</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Phase: user picks outcome */}
        {phase === "outcome_choice" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How did it go?</Text>
            <View style={styles.outcomeChoiceList}>
              <Pressable
                style={styles.outcomeChoiceButton}
                onPress={() => handleOutcomeChoice("resisted")}
              >
                <View style={styles.outcomeChoiceTextBlock}>
                  <Text style={styles.outcomeChoiceLabel}>
                    I resisted the urge
                  </Text>
                </View>
                <View style={styles.xpChip}>
                  <Text style={styles.xpChipText}>+{XP_AWARDS.panic_resist} XP</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.outcomeChoiceButton}
                onPress={() => handleOutcomeChoice("partial")}
              >
                <View style={styles.outcomeChoiceTextBlock}>
                  <Text style={styles.outcomeChoiceLabel}>
                    I partially resisted
                  </Text>
                </View>
                <View style={styles.xpChip}>
                  <Text style={styles.xpChipText}>+{XP_AWARDS.panic_partial} XP</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.outcomeChoiceButton, styles.outcomeChoiceNeutral]}
                onPress={() => handleOutcomeChoice("compulsion")}
              >
                <View style={styles.outcomeChoiceTextBlock}>
                  <Text style={styles.outcomeChoiceLabel}>I gave in</Text>
                  <Text style={styles.outcomeChoiceSub}>
                    That's okay — you showed up.
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Phase: result */}
        {phase === "outcome" && (
          <View style={[styles.section, styles.outcomeSection]}>
            <Text style={styles.outcomeEmoji}>
              {chosenOutcome === "resisted"
                ? "✨"
                : chosenOutcome === "partial"
                  ? "🌱"
                  : "💛"}
            </Text>
            <Text style={styles.outcomeTitle}>
              {chosenOutcome === "resisted"
                ? "You stayed with a hard moment."
                : chosenOutcome === "partial"
                  ? "Every bit of resistance matters."
                  : "You showed up. That takes courage."}
            </Text>
            <Text style={styles.outcomeText}>
              {chosenOutcome === "compulsion"
                ? "Coming back to this moment is already a step forward."
                : "Each time you pause like this, you build a little more space between urges and actions."}
            </Text>
            {chosenXp > 0 && (
              <View style={styles.xpChip}>
                <Text style={styles.xpChipText}>+{chosenXp} XP</Text>
              </View>
            )}
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                resetFlow();
                router.navigate("/(tabs)/pet");
              }}
            >
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
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
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
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
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
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
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
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
  },
  intensityHint: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
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
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: colors.textSecondary,
  },
  timerSection: {
    alignItems: "center",
    gap: 16,
  },
  timerHint: {
    fontFamily: "Nunito_400Regular",
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
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
    color: colors.textPrimary,
  },
  timerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignSelf: "stretch",
  },
  scriptText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  // Outcome choice
  outcomeChoiceList: {
    gap: 10,
  },
  outcomeChoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  outcomeChoiceNeutral: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  outcomeChoiceTextBlock: {
    flex: 1,
    gap: 2,
  },
  outcomeChoiceLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  outcomeChoiceSub: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Outcome result
  outcomeSection: {
    alignItems: "center",
    gap: 12,
  },
  outcomeEmoji: {
    fontSize: 40,
  },
  outcomeTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
  },
  outcomeText: {
    fontFamily: "Nunito_400Regular",
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
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: colors.accent,
  },
});
