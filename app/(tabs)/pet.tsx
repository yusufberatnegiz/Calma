import React, { useState } from "react";
import { Text, StyleSheet, View, Pressable, Image, ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme/colors";

type CatStage = "baby" | "teen" | "adult";

const stages: CatStage[] = ["baby", "teen", "adult"];

const stageLabels: Record<CatStage, string> = {
  baby: "Kitten",
  teen: "Cat",
  adult: "Royal Cat",
};

const xpThresholds: Record<CatStage, number> = {
  baby: 40,
  teen: 80,
  adult: Infinity,
};

const catImages: Record<CatStage, ImageSourcePropType> = {
  baby: require("../../assets/cat-baby.png"),
  teen: require("../../assets/cat-idle.png"),
  adult: require("../../assets/cat-grown.png"),
};

const CAT_IMAGE_SIZE = 200;

export default function PetScreen() {
  const [petName] = useState("Mochi");
  const [stage, setStage] = useState<CatStage>("baby");
  const [xp, setXp] = useState(35);
  const [mood] = useState("happy");

  const handlePetCat = () => {
    // Petting / touching the pet does not grant XP.
  };

  const handleGrow = () => {
    const currentIndex = stages.indexOf(stage);
    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1]);
      setXp(0);
    }
  };

  const level = stages.indexOf(stage) + 1;
  const canEvolve = stage !== "adult" && xp >= xpThresholds[stage];

  return (
    <Screen>
      <View style={[styles.container, styles.backgroundGradient]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.mood}>
              {petName} is feeling {mood}
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        </View>

        <View style={styles.main}>
          <Pressable onPress={handlePetCat} style={styles.catImageWrap}>
            <Image
              source={catImages[stage]}
              style={styles.catImage}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={styles.stageLabel}>{stageLabels[stage]}</Text>
          <Text style={styles.petName}>{petName}</Text>

          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpMeta}>Level {level}</Text>
              <Text style={styles.xpMeta}>{xp}/100</Text>
            </View>
            <View style={styles.xpBarBackground}>
              <View style={[styles.xpBarFill, { width: `${xp}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Resisted</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {canEvolve ? (
          <Pressable style={styles.growButton} onPress={handleGrow}>
            <Text style={styles.growButtonText}>✨ Evolve {petName}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.petButton} onPress={handlePetCat}>
            <Text style={styles.petButtonText}>🐾 Pet {petName}</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  backgroundGradient: {
    backgroundColor: colors.backgroundGradientTop,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  mood: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  catImageWrap: {
    width: CAT_IMAGE_SIZE,
    height: CAT_IMAGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  catImage: {
    width: CAT_IMAGE_SIZE,
    height: CAT_IMAGE_SIZE,
  },
  stageLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  petName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  xpSection: {
    marginTop: 12,
    width: 220,
    gap: 4,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  xpBarBackground: {
    marginTop: 4,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  growButton: {
    alignSelf: "center",
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.evolveGreen,
  },
  growButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.evolveGreenText,
  },
  petButton: {
    alignSelf: "center",
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  petButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
