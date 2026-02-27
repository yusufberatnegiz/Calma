import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";

type CatStage = "baby" | "teen" | "adult";

const stages: CatStage[] = ["baby", "teen", "adult"];

const stageLabels: Record<CatStage, string> = {
  baby: "Kitten",
  teen: "Cat",
  adult: "Royal Cat",
};

const stageEmoji: Record<CatStage, string> = {
  baby: "🐱",
  teen: "🐈",
  adult: "👑",
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

const CAT_IMAGE_SIZE = 240;

export default function PetScreen() {
  const insets = useSafeAreaInsets();
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
  const xpPercent = Math.min((xp / 100) * 100, 100);

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top + 4, 20),
            paddingBottom: Math.max(insets.bottom + 8, 16),
          },
        ]}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.mood}>
              {petName} is feeling {mood}
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={13} color={colors.accent} />
            <Text style={styles.xpBadgeText}>{xp} XP</Text>
          </View>
        </View>

        {/* ── Pet display ── */}
        <View style={styles.main}>
          <Pressable onPress={handlePetCat} style={styles.catImageWrap}>
            <Image
              source={catImages[stage]}
              style={styles.catImage}
              resizeMode="contain"
            />
          </Pressable>

          {/* Stage chip */}
          <View style={styles.stageChip}>
            <Text style={styles.stageChipText}>
              {stageEmoji[stage]} {stageLabels[stage]}
            </Text>
          </View>

          <Text style={styles.petName}>{petName}</Text>

          {/* XP bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpMeta}>Level {level}</Text>
              <Text style={styles.xpMeta}>{xp} / 100</Text>
            </View>
            <View style={styles.xpBarBg}>
              <LinearGradient
                colors={[colors.accentLight, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${xpPercent}%` }]}
              />
            </View>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={18} color="#F472B6" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Resisted</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={18} color="#FB923C" />
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* ── Action button ── */}
        {canEvolve ? (
          <Pressable style={styles.evolveButton} onPress={handleGrow}>
            <Text style={styles.evolveButtonText}>✨ Evolve {petName}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.petButton} onPress={handlePetCat}>
            <Text style={styles.petButtonText}>🐾 Pet {petName}</Text>
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 22,
    gap: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  mood: {
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  xpBadgeText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: colors.accent,
  },

  // Main pet area
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
  stageChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stageChipText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: colors.textSecondary,
  },
  petName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  // XP
  xpSection: {
    width: 220,
    gap: 6,
    marginTop: 4,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpMeta: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    color: colors.textSecondary,
  },
  xpBarBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.accentLight,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 999,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statValue: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Buttons
  evolveButton: {
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.evolveGreen,
    alignItems: "center",
  },
  evolveButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: colors.evolveGreenText,
  },
  petButton: {
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceCard,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  petButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: colors.accent,
  },
});
