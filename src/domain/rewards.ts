/**
 * Domain: Reward logic
 *
 * XP thresholds (per-stage – XP resets to 0 on evolution):
 *   baby  → teen  at 100 XP
 *   teen  → elite at 250 XP
 *   elite → royal at 500 XP
 *   royal is the final stage (post-max XP routes to royalXp in petStore)
 *
 * XP awards:
 *   Panic resist      → +10 XP
 *   Panic partial     → +5 XP
 *   Panic compulsion  → +0 XP
 *   Task complete     → task.xp (default 10–15 per task)
 *   All tasks bonus   → +30 XP (once per day)
 *   Daily log save    → +5 XP
 *
 * Post-Royal (Royal Cat stage):
 *   Every ROYAL_STAR_XP (200) XP earns +1 Royal Star (with rollover).
 *   Stars unlock content defined in ROYAL_UNLOCK_TABLE.
 */

export type CatStage = "baby" | "teen" | "elite" | "royal";

/** Per-stage XP needed to evolve to the next stage (XP resets on evolution). */
export const XP_THRESHOLDS: Record<CatStage, number> = {
  baby: 100,
  teen: 250,
  elite: 500,
  royal: Infinity,
};

/** XP required to earn one Royal Star after reaching Royal Cat. */
export const ROYAL_STAR_XP = 200;

const STAGE_ORDER: CatStage[] = ["baby", "teen", "elite", "royal"];

/**
 * Returns the next stage if xp >= threshold for the current stage.
 * Pure function – does NOT mutate state.
 */
export function maybeEvolve(xp: number, stage: CatStage): CatStage {
  if (stage === "royal") return "royal";
  if (xp >= XP_THRESHOLDS[stage]) {
    return STAGE_ORDER[STAGE_ORDER.indexOf(stage) + 1] as CatStage;
  }
  return stage;
}

/** Fixed XP amounts awarded per action. */
export const XP_AWARDS = {
  panic_resist: 10,
  panic_partial: 5,
  panic_compulsion: 0,
  task_all_bonus: 30,
  log_save: 5,
} as const;

/**
 * Deterministic unlock table for Royal Stars.
 * Each entry unlocks at the given star count.
 * IDs are opaque strings that consumers check against.
 */
export const ROYAL_UNLOCK_TABLE: Array<{ stars: number; id: string; label: string }> = [
  { stars: 1,  id: "task_gratitude",    label: "Gratitude task pack" },
  { stars: 2,  id: "bg_sunset",         label: "Sunset background" },
  { stars: 3,  id: "task_grounding",    label: "Grounding task pack" },
  { stars: 5,  id: "prompt_ocean",      label: "Ocean reflection prompts" },
  { stars: 7,  id: "bg_forest",         label: "Forest background" },
  { stars: 10, id: "task_mindfulness",  label: "Mindfulness task pack" },
];

/**
 * Returns content IDs newly unlocked when stars increase from oldStars to newStars.
 * Pure function – does NOT mutate state.
 */
export function getNewUnlocks(oldStars: number, newStars: number): string[] {
  return ROYAL_UNLOCK_TABLE
    .filter((u) => u.stars > oldStars && u.stars <= newStars)
    .map((u) => u.id);
}

/**
 * XP needed from current royalXp to the next Royal Star.
 * royalXp is the remainder within the current star interval (0 – ROYAL_STAR_XP-1).
 */
export function xpToNextRoyalStar(royalXp: number): number {
  return ROYAL_STAR_XP - royalXp;
}

// ---------------------------------------------------------------------------
// Minimal dispatch type — avoids circular dep with petStore.
// petStore's dispatch is compatible because it accepts these action shapes.
// ---------------------------------------------------------------------------
type PetXpDispatch = (action:
  | { type: "ADD_XP"; amount: number }
  | { type: "MARK_ACTIVITY"; dateKey: string }
) => void;

/**
 * Central XP award entry-point used by all screens.
 *
 * - All XP routing to normal vs royal buckets is handled by the petStore reducer.
 * - Pass activityDateKey to also mark a streak activity for that date.
 * - Reason is for documentation / future analytics (not persisted yet).
 */
export function awardXp(
  dispatch: PetXpDispatch,
  opts: { amount: number; reason: string; activityDateKey?: string }
): void {
  if (opts.amount > 0) {
    dispatch({ type: "ADD_XP", amount: opts.amount });
  }
  if (opts.activityDateKey) {
    dispatch({ type: "MARK_ACTIVITY", dateKey: opts.activityDateKey });
  }
}

/** Returns today's date key (local time) in YYYY-MM-DD format. */
export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns the previous day's date key for a given YYYY-MM-DD string. */
export function prevDayKey(dateKey: string): string {
  const [y, m, day] = dateKey.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() - 1);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
