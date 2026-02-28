import React, { useState } from "react";
import { Text, StyleSheet, View, Pressable, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme/colors";

type MoodValue = 1 | 3 | 5;

function NeutralFaceIcon({ size = 24, color = "#000" }: { size?: number; color?: string }) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2 * s,
        borderColor: color,
      }} />
      <View style={{
        position: "absolute",
        width: 3 * s,
        height: 3 * s,
        borderRadius: 2 * s,
        backgroundColor: color,
        top: 8 * s,
        left: 8 * s,
      }} />
      <View style={{
        position: "absolute",
        width: 3 * s,
        height: 3 * s,
        borderRadius: 2 * s,
        backgroundColor: color,
        top: 8 * s,
        right: 8 * s,
      }} />
      <View style={{
        position: "absolute",
        height: 2 * s,
        width: 10 * s,
        backgroundColor: color,
        borderRadius: 1 * s,
        bottom: 7 * s,
        left: 7 * s,
      }} />
    </View>
  );
}

type MoodOption = {
  value: MoodValue;
  label: string;
} & (
  | { icon: keyof typeof Ionicons.glyphMap; CustomIcon?: never }
  | { CustomIcon: React.ComponentType<{ size: number; color: string }>; icon?: never }
);

const moodOptions: MoodOption[] = [
  { value: 5, icon: "happy-outline", label: "Great" },
  { value: 3, CustomIcon: NeutralFaceIcon, label: "Okay" },
  { value: 1, icon: "sad-outline", label: "Rough" },
];

const compulsionTypes = ["Checking", "Washing", "Counting", "Ordering", "Other"];

export default function LogScreen() {
  const [dayRating, setDayRating] = useState<MoodValue | null>(null);
  const [compulsionCount, setCompulsionCount] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <Screen backgroundColor="transparent">
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Daily Log</Text>
        <Text style={styles.subtitle}>How was your day?</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day rating</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((mood) => {
              const isSelected = dayRating === mood.value;
              const iconColor = isSelected ? "#FFFFFF" : colors.textPrimary;
              return (
                <Pressable
                  key={mood.value}
                  style={[
                    styles.moodCard,
                    isSelected && styles.moodCardSelected,
                  ]}
                  onPress={() => setDayRating(mood.value)}
                >
                  {mood.CustomIcon ? (
                    <mood.CustomIcon size={24} color={iconColor} />
                  ) : (
                    <Ionicons name={mood.icon} size={24} color={iconColor} />
                  )}
                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && { color: "#FFFFFF" },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compulsions today</Text>
          <View style={styles.countRow}>
            <Pressable
              style={styles.countButton}
              onPress={() => setCompulsionCount(Math.max(0, compulsionCount - 1))}
            >
              <Text style={styles.countButtonText}>−</Text>
            </Pressable>
            <Text style={styles.countValue}>{compulsionCount}</Text>
            <Pressable
              style={styles.countButton}
              onPress={() => setCompulsionCount(compulsionCount + 1)}
            >
              <Text style={styles.countButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types</Text>
          <View style={styles.typesRow}>
            {compulsionTypes.map((type) => {
              const selected = selectedTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                  onPress={() => toggleType(type)}
                >
                  <Text
                    style={[
                      styles.typeChipLabel,
                      selected && { color: "#FFFFFF" },
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="How are you feeling? (optional)"
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <Pressable
          style={[styles.saveButton, saved && styles.saveButtonSaved]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saved ? "Saved" : "Save log"}
          </Text>
        </Pressable>
      </ScrollView>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  moodRow: {
    flexDirection: "row",
    gap: 12,
  },
  moodCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  moodCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  moodLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  countButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  countValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  typeChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  typeChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  notesInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 96,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.textPrimary,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.textPrimary,
  },
  saveButtonSaved: {
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

