import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#FF6B6B", "#FFE66D", "#4ECDC4", "#A8E6CF",
  "#FFB347", "#C3A6FF", "#87CEEB", "#FF9EAA",
];

type Task = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  isCustom?: boolean;
};

type ConfettiPiece = {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Delay a compulsion for 2 min",
    description: "When you feel the urge, wait just 2 minutes before acting.",
    xpReward: 15,
    completed: false,
  },
  {
    id: "2",
    title: "Name your feeling",
    description: "When anxiety rises, say out loud what you're noticing.",
    xpReward: 10,
    completed: false,
  },
  {
    id: "3",
    title: "5 deep breaths",
    description: "Take 5 slow, deep breaths. In through the nose, out through the mouth.",
    xpReward: 10,
    completed: false,
  },
  {
    id: "4",
    title: "Touch something cold",
    description: "Hold ice or cold water for 30 seconds to ground yourself.",
    xpReward: 10,
    completed: false,
  },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const bonusGivenRef = useRef(false);
  const confettiId = useRef(0);

  const completedCount = tasks.filter((t) => t.completed).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;
  const completionPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;
  const earnedXp =
    tasks.filter((t) => t.completed).reduce((s, t) => s + t.xpReward, 0) +
    (allDone ? 30 : 0);

  const launchConfetti = () => {
    const PIECES = 60;
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < PIECES; i++) {
      const id = confettiId.current++;
      const startX = Math.random() * SCREEN_WIDTH;
      const x = new Animated.Value(startX);
      const y = new Animated.Value(-30);
      const rotate = new Animated.Value(0);
      const opacity = new Animated.Value(1);
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const size = 7 + Math.random() * 9;
      const delay = Math.random() * 700;
      const duration = 2200 + Math.random() * 1200;

      newPieces.push({ id, x, y, rotate, opacity, color, size });

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(y, {
            toValue: SCREEN_HEIGHT + 50,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(x, {
            toValue: startX + (Math.random() - 0.5) * 180,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(duration * 0.65),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.35,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() =>
          setConfettiPieces((prev) => prev.filter((p) => p.id !== id))
        );
      }, delay);
    }

    setConfettiPieces((prev) => [...prev, ...newPieces]);
  };

  // Trigger confetti + bonus when every task is ticked
  useEffect(() => {
    const allCompleted = tasks.length > 0 && tasks.every((t) => t.completed);
    if (allCompleted && !bonusGivenRef.current) {
      bonusGivenRef.current = true;
      launchConfetti();
    }
    if (!allCompleted) {
      bonusGivenRef.current = false;
    }
  }, [tasks]);

  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const addTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        description: "",
        xpReward: 10,
        completed: false,
        isCustom: true,
      },
    ]);
    setNewTaskTitle("");
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <Screen backgroundColor="transparent">
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Daily Tasks</Text>
          <Text style={styles.subtitle}>Small steps, big progress.</Text>

          {/* Progress card */}
          <View style={styles.progressCard}>
            <View style={styles.progressIconWrapper}>
              <Ionicons name="sparkles-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.progressBody}>
              <View style={styles.progressTitleRow}>
                <Text style={styles.progressTitle}>
                  {completedCount}/{tasks.length} completed
                </Text>
                {earnedXp > 0 && (
                  <Text style={styles.xpEarned}>+{earnedXp} XP</Text>
                )}
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[styles.progressBarFill, { width: `${completionPercent}%` }]}
                />
              </View>
            </View>
          </View>

          {/* All-done bonus banner */}
          {allDone && (
            <View style={styles.bonusBanner}>
              <Text style={styles.bonusBannerText}>
                🎉 All done! +30 bonus XP earned!
              </Text>
            </View>
          )}

          {/* Task list */}
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <View
                key={task.id}
                style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
              >
                {/* Tappable main area */}
                <Pressable
                  onPress={() => toggleTask(task.id)}
                  style={styles.taskCardInner}
                >
                  <View
                    style={[styles.checkbox, task.completed && styles.checkboxChecked]}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.taskTextContainer}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    {!!task.description && (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    )}
                  </View>
                  <Text style={styles.taskXp}>+{task.xpReward} XP</Text>
                </Pressable>

                {/* Delete button */}
                <Pressable
                  onPress={() => deleteTask(task.id)}
                  style={styles.deleteButton}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add custom task */}
          <View style={styles.addTaskRow}>
            <TextInput
              style={styles.addTaskInput}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Add your own task…"
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={addTask}
              returnKeyType="done"
              maxLength={80}
            />
            <Pressable
              onPress={addTask}
              style={[
                styles.addTaskButton,
                !newTaskTitle.trim() && styles.addTaskButtonDisabled,
              ]}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </Pressable>
          </View>
        </ScrollView>
      </Screen>

      {/* Confetti overlay — rendered above everything, no touch events */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {confettiPieces.map((piece) => (
          <Animated.View
            key={piece.id}
            style={{
              position: "absolute",
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: 2,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "720deg"],
                  }),
                },
              ],
              opacity: piece.opacity,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
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

  // Progress
  progressCard: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBody: {
    flex: 1,
    gap: 6,
  },
  progressTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  xpEarned: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.accent,
  },

  // Bonus banner
  bonusBanner: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
    alignItems: "center",
  },
  bonusBannerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C2410C",
  },

  // Task list
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
  },
  taskCardCompleted: {
    backgroundColor: "#EEF2FF",
    borderColor: colors.accent,
  },
  taskCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  taskTextContainer: {
    flex: 1,
    gap: 3,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  taskTitleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  taskDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskXp: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignSelf: "stretch",
    justifyContent: "center",
  },

  // Add task
  addTaskRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  addTaskInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addTaskButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addTaskButtonDisabled: {
    opacity: 0.4,
  },
});
