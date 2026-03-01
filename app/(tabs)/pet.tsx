import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  ImageSourcePropType,
  Animated,
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

const CAT_SIZE = 240;
const PX = 4; // pixel art unit size

// 7 × 6 red pixel heart
const HEART_MAP = [
  [0, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
];

// 5 × 5 gold sparkle (diamond cross)
const STAR_MAP = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

function PixelHeart() {
  return (
    <View>
      {HEART_MAP.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row" }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={{
                width: PX,
                height: PX,
                backgroundColor: cell ? "#FF3B5C" : "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function PixelStar() {
  return (
    <View>
      {STAR_MAP.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row" }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={{
                width: PX,
                height: PX,
                backgroundColor: cell ? "#FFD700" : "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

type FloatingHeart = {
  id: number;
  x: number;
  translateY: Animated.Value;
  opacity: Animated.Value;
};

type FloatingSparkle = {
  id: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
};

export default function PetScreen() {
  const insets = useSafeAreaInsets();
  const [petName] = useState("Mochi");
  const [stage, setStage] = useState<CatStage>("baby");
  const [xp, setXp] = useState(35);
  const [mood] = useState("happy");
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [sparkles, setSparkles] = useState<FloatingSparkle[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const heartId = useRef(0);
  const sparkleId = useRef(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef(stage);
  useEffect(() => { stageRef.current = stage; }, [stage]);

  // Animated values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const catScale = useRef(new Animated.Value(1)).current;
  const catOpacity = useRef(new Animated.Value(1)).current;
  const evolveFlash = useRef(new Animated.Value(0)).current;

  // Idle float loop (gentle up-down bob)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Periodic blink every 3-5.5s
  // Kitten: swaps to cat-blink.png for 150 ms
  // Other stages: brief opacity dip
  useEffect(() => {
    const schedule = () => {
      blinkTimer.current = setTimeout(() => {
        if (stageRef.current === "baby") {
          setIsBlinking(true);
          blinkCloseTimer.current = setTimeout(() => {
            setIsBlinking(false);
            schedule();
          }, 150);
        } else {
          Animated.sequence([
            Animated.timing(catOpacity, {
              toValue: 0.5,
              duration: 70,
              useNativeDriver: true,
            }),
            Animated.timing(catOpacity, {
              toValue: 1,
              duration: 70,
              useNativeDriver: true,
            }),
          ]).start(() => schedule());
        }
      }, 3000 + Math.random() * 2500);
    };
    schedule();
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      if (blinkCloseTimer.current) clearTimeout(blinkCloseTimer.current);
    };
  }, []);

  const spawnHeart = () => {
    const id = heartId.current++;
    const x = (Math.random() - 0.5) * 100;
    const translateY = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    setHearts((p) => [...p, { id, x, translateY, opacity }]);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -90,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setHearts((p) => p.filter((h) => h.id !== id)));
  };

  const spawnSparkles = () => {
    // 8 directions radiating outward
    const dirs = [
      { tx: 0, ty: -105 },
      { tx: 74, ty: -74 },
      { tx: 105, ty: 0 },
      { tx: 74, ty: 74 },
      { tx: 0, ty: 105 },
      { tx: -74, ty: 74 },
      { tx: -105, ty: 0 },
      { tx: -74, ty: -74 },
    ];
    dirs.forEach(({ tx, ty }, i) => {
      setTimeout(() => {
        const id = sparkleId.current++;
        const translateX = new Animated.Value(0);
        const translateY = new Animated.Value(0);
        const opacity = new Animated.Value(1);
        setSparkles((p) => [...p, { id, translateX, translateY, opacity }]);
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: tx,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: ty,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => setSparkles((p) => p.filter((s) => s.id !== id)));
      }, i * 40);
    });
  };

  const handlePetCat = () => {
    if (isEvolving) return;
    setXp((prev) => Math.min(prev + 5, 100));
    // Spawn 2-3 hearts staggered
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) setTimeout(spawnHeart, i * 180);
    // Quick bounce
    Animated.sequence([
      Animated.timing(catScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(catScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGrow = () => {
    if (isEvolving) return;
    setIsEvolving(true);
    spawnSparkles();
    // Power-up: escalating pulses → golden flash → settle → stage change
    Animated.sequence([
      Animated.timing(catScale, {
        toValue: 1.12,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(catScale, {
        toValue: 0.94,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(catScale, {
        toValue: 1.2,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(catScale, {
        toValue: 0.94,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(catScale, {
        toValue: 1.3,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(evolveFlash, {
        toValue: 0.85,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(evolveFlash, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(catScale, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const idx = stages.indexOf(stage);
      if (idx < stages.length - 1) {
        setStage(stages[idx + 1]);
        setXp(0);
      }
      setIsEvolving(false);
    });
  };

  const level = stages.indexOf(stage) + 1;
  const canEvolve = stage !== "adult" && xp >= xpThresholds[stage];
  const xpPercent = Math.min((xp / 100) * 100, 100);

  // Particle anchor positions within catWrap
  const heartCenterX = CAT_SIZE / 2 - PX * 3.5; // center 7-col heart
  const sparkCenterX = CAT_SIZE / 2 - PX * 2.5; // center 5-col star
  const sparkCenterY = CAT_SIZE / 2 - PX * 2.5;

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
          <Pressable onPress={handlePetCat} style={styles.catWrap}>
            {/* Cat image (renders first = behind particles) */}
            <Animated.Image
              source={
                isBlinking
                  ? require("../../assets/cat-blink.png")
                  : catImages[stage]
              }
              style={[
                styles.catImage,
                {
                  opacity: catOpacity,
                  transform: [{ translateY: floatAnim }, { scale: catScale }],
                },
              ]}
              resizeMode="contain"
            />

            {/* Floating red hearts (petting) */}
            {hearts.map((h) => (
              <Animated.View
                key={h.id}
                pointerEvents="none"
                style={[
                  styles.particle,
                  {
                    left: heartCenterX + h.x,
                    top: CAT_SIZE * 0.45,
                    transform: [{ translateY: h.translateY }],
                    opacity: h.opacity,
                  },
                ]}
              >
                <PixelHeart />
              </Animated.View>
            ))}

            {/* Gold sparkles (evolve) */}
            {sparkles.map((s) => (
              <Animated.View
                key={s.id}
                pointerEvents="none"
                style={[
                  styles.particle,
                  {
                    left: sparkCenterX,
                    top: sparkCenterY,
                    transform: [
                      { translateX: s.translateX },
                      { translateY: s.translateY },
                    ],
                    opacity: s.opacity,
                  },
                ]}
              >
                <PixelStar />
              </Animated.View>
            ))}
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

      {/* Golden flash overlay for evolve */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "#FFD700", opacity: evolveFlash },
        ]}
      />
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
  catWrap: {
    width: CAT_SIZE,
    height: CAT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  catImage: {
    width: CAT_SIZE,
    height: CAT_SIZE,
  },
  particle: {
    position: "absolute",
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
