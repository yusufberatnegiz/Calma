import React, { useState } from "react";
import { Text, StyleSheet, View, Pressable, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme/colors";

type MoodValue = 1 | 3 | 5;

const moodOptions: { value: MoodValue; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { value: 5, icon: "happy-outline", label: "Great" },
  { value: 3, icon: "remove-outline", label: "Okay" },
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
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Daily Log</Text>
        <Text style={styles.subtitle}>How was your day?</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day rating</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((mood) => {
              const Icon = Ionicons;
              const isSelected = dayRating === mood.value;
              return (
                <Pressable
                  key={mood.value}
                  style={[
                    styles.moodCard,
                    isSelected && styles.moodCardSelected,
                  ]}
                  onPress={() => setDayRating(mood.value)}
                >
                  <Icon
                    name={mood.icon}
                    size={24}
                    color={isSelected ? "#FFFFFF" : colors.textPrimary}
                  />
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

