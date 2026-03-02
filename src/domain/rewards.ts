/**
 * Domain: Reward logic
 *
 * XP thresholds (per-stage – XP resets to 0 on evolution):
 *   baby  → teen  at 100 XP
 *   teen  → elite at 250 XP
 *   elite → royal at 500 XP
 *   royal is the final stage
 *
 * XP awards:
 *   Panic resist      → +10 XP
 *   Panic partial     → +5 XP
 *   Panic compulsion  → +0 XP
 *   Task complete     → task.xp (default 10–15 per task)
 *   All tasks bonus   → +30 XP (once per day)
 *   Daily log save    → +5 XP
 */

export type CatStage = "baby" | "teen" | "elite" | "royal";

/** Per-stage XP needed to evolve to the next stage (XP resets on evolution). */
export const XP_THRESHOLDS: Record<CatStage, number> = {
  baby: 100,
  teen: 250,
  elite: 500,
  royal: Infinity,
};

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
