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
import { useTasks } from "../../src/state/taskStore";
import { usePet } from "../../src/state/petStore";
import { XP_AWARDS, awardXp, getTodayKey } from "../../src/domain/rewards";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Reduced confetti palette and count for a calmer feel
const CONFETTI_COLORS = [
  "#C3A6FF", "#A8E6CF", "#87CEEB", "#DDD6FE", "#FCD5CE",
];

type ConfettiPiece = {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
};

export default function TasksScreen() {
  const today = getTodayKey();
  const { tasks, storeReady, bonusAwardedDate, dispatch: taskDispatch } = useTasks();
  const { dispatch: petDispatch } = usePet();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const confettiId = useRef(0);

  // Ensure default daily tasks exist only after the store has loaded from storage
  useEffect(() => {
    if (!storeReady) return;
    taskDispatch({ type: "ENSURE_DAILY", dateKey: today });
  }, [storeReady, today]);

  // Today's tasks only
  const todayTasks = tasks.filter((t) => t.dateKey === today);
  const completedCount = todayTasks.filter((t) => t.isCompleted).length;
  const allDone = todayTasks.length > 0 && completedCount === todayTasks.length;
  const completionPercent = todayTasks.length
    ? Math.round((completedCount / todayTasks.length) * 100)
    : 0;
  const earnedXp =
    todayTasks.filter((t) => t.isCompleted).reduce((s, t) => s + t.xp, 0) +
    (bonusAwardedDate === today ? XP_AWARDS.task_all_bonus : 0);

  // Toned-down confetti: 20 pieces instead of 60
  const launchConfetti = () => {
    const PIECES = 20;
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < PIECES; i++) {
      const id = confettiId.current++;
      const startX = Math.random() * SCREEN_WIDTH;
      const x = new Animated.Value(startX);
      const y = new Animated.Value(-20);
      const rotate = new Animated.Value(0);
      const opacity = new Animated.Value(1);
      const color =
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const size = 6 + Math.random() * 6;
      const delay = Math.random() * 400;
      const duration = 1800 + Math.random() * 800;

      newPieces.push({ id, x, y, rotate, opacity, color, size });

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(y, {
            toValue: SCREEN_HEIGHT * 0.6,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(x, {
            toValue: startX + (Math.random() - 0.5) * 120,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(duration * 0.6),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.4,
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

  const handleToggleTask = (taskId: string, taskXp: number, isCompleted: boolean) => {
    taskDispatch({ type: "TOGGLE_TASK", id: taskId });

    if (!isCompleted) {
      // Task is being completed (not un-completed)
      awardXp(petDispatch, { amount: taskXp, reason: "task_complete", activityDateKey: today });
      petDispatch({ type: "RECORD_TASK_COMPLETED" });

      // Check if this completes all tasks and bonus hasn't been awarded today
      const remainingAfter = todayTasks.filter(
        (t) => !t.isCompleted && t.id !== taskId
      );
      if (remainingAfter.length === 0 && bonusAwardedDate !== today) {
        taskDispatch({ type: "SET_BONUS_DATE", dateKey: today });
        awardXp(petDispatch, { amount: XP_AWARDS.task_all_bonus, reason: "task_all_bonus" });
        launchConfetti();
      }
    }
  };

  const handleDeleteTask = (id: string) =>
    taskDispatch({ type: "DELETE_TASK", id });

  const handleAddTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    taskDispatch({
      type: "ADD_CUSTOM",
      task: {
        id: `${today}_custom_${Date.now()}`,
        title,
        description: "",
        xp: 10,
        isCompleted: false,
        dateKey: today,
        isCustom: true,
      },
    });
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
                  {completedCount}/{todayTasks.length} completed
                </Text>
                {earnedXp > 0 && (
                  <Text style={styles.xpEarned}>+{earnedXp} XP</Text>
                )}
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${completionPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* All-done bonus banner */}
          {allDone && (
            <View style={styles.bonusBanner}>
              <Text style={styles.bonusBannerText}>
                🎉 All done! +{XP_AWARDS.task_all_bonus} bonus XP earned!
              </Text>
            </View>
          )}

          {/* Task list */}
          <View style={styles.tasksList}>
            {todayTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.isCompleted && styles.taskCardCompleted,
                ]}
              >
                <Pressable
                  onPress={() =>
                    handleToggleTask(task.id, task.xp, task.isCompleted)
                  }
                  style={styles.taskCardInner}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.isCompleted && styles.checkboxChecked,
                    ]}
                  >
                    {task.isCompleted && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.taskTextContainer}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    {!!task.description && (
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.taskXp}>+{task.xp} XP</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDeleteTask(task.id)}
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
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
              maxLength={80}
            />
            <Pressable
              onPress={handleAddTask}
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

      {/* Confetti overlay — no touch events */}
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
                    outputRange: ["0deg", "360deg"],
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
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
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
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  xpEarned: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
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
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#C2410C",
  },
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
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  taskTitleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  taskDescription: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskXp: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: colors.accent,
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  addTaskRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  addTaskInput: {
    fontFamily: "Nunito_400Regular",
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
