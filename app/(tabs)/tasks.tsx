import React, { useState } from "react";
import { Text, StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme/colors";

type Task = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
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
    completed: true,
  },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const completedCount = tasks.filter((t) => t.completed).length;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completionPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Daily Tasks</Text>
        <Text style={styles.subtitle}>Small steps, big progress.</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressIconWrapper}>
            <Ionicons name="sparkles-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.progressBody}>
            <Text style={styles.progressTitle}>
              {completedCount}/{tasks.length} completed
            </Text>
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

        <View style={styles.tasksList}>
          {tasks.map((task, index) => (
            <Pressable
              key={task.id}
              style={[
                styles.taskCard,
                task.completed && styles.taskCardCompleted,
              ]}
              onPress={() => toggleTask(task.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked,
                ]}
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
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
              <View style={styles.taskMeta}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.taskXp}>+{task.xpReward}</Text>
              </View>
            </Pressable>
          ))}
        </View>
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
  progressCard: {
    marginTop: 12,
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
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
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
  tasksList: {
    marginTop: 8,
    gap: 10,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  taskCardCompleted: {
    backgroundColor: "#EEF2FF",
    borderColor: colors.accent,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  taskTextContainer: {
    flex: 1,
    gap: 4,
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
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  taskXp: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

