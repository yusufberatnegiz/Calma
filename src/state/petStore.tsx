import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CatStage, prevDayKey, ROYAL_STAR_XP, getNewUnlocks } from "../domain/rewards";

export type { CatStage };

export type PetState = {
  name: string;
  xp: number;
  stage: CatStage;
  /** Sessions with outcome 'resisted' or 'partial'. */
  totalResists: number;
  /** Cumulative tasks completed count. */
  tasksCompleted: number;
  /** Consecutive days with at least one activity. */
  streak: number;
  /** Last date (YYYY-MM-DD) the user was active. */
  lastActiveDate: string | null;
  // Post-Royal progression
  /** XP accumulated within the current Royal Star interval (0 – ROYAL_STAR_XP-1). */
  royalXp: number;
  /** Total Royal Stars earned so far. */
  royalStars: number;
  /** Content IDs unlocked via Royal Stars (task packs, backgrounds, prompts). */
  royalUnlocks: string[];
};

export type PetAction =
  | { type: "LOAD"; payload: Partial<PetState> }
  | { type: "ADD_XP"; amount: number }
  | { type: "EVOLVE" }
  | { type: "RECORD_RESIST" }
  | { type: "RECORD_TASK_COMPLETED" }
  | { type: "MARK_ACTIVITY"; dateKey: string }
  | { type: "SET_NAME"; name: string };

const STAGES: CatStage[] = ["baby", "teen", "elite", "royal"];
const STORAGE_KEY = "@calma/pet";

const defaultState: PetState = {
  name: "Mochi",
  xp: 0,
  stage: "baby",
  totalResists: 0,
  tasksCompleted: 0,
  streak: 0,
  lastActiveDate: null,
  royalXp: 0,
  royalStars: 0,
  royalUnlocks: [],
};

function petReducer(state: PetState, action: PetAction): PetState {
  switch (action.type) {
    case "LOAD": {
      // Merge stored payload over defaults so new fields always have values
      // even when loading an older save that predates them.
      return {
        ...defaultState,
        ...action.payload,
        royalXp: action.payload.royalXp ?? 0,
        royalStars: action.payload.royalStars ?? 0,
        royalUnlocks: action.payload.royalUnlocks ?? [],
      };
    }

    case "ADD_XP": {
      if (state.stage === "royal") {
        // Post-max: route XP into royalXp, earn stars with rollover
        const newRoyalXp = state.royalXp + action.amount;
        const newStars = Math.floor(newRoyalXp / ROYAL_STAR_XP);
        const totalStars = state.royalStars + newStars;
        const remainingXp = newRoyalXp % ROYAL_STAR_XP;
        const newUnlocks = newStars > 0
          ? getNewUnlocks(state.royalStars, totalStars)
          : [];
        return {
          ...state,
          royalXp: remainingXp,
          royalStars: totalStars,
          royalUnlocks: newUnlocks.length > 0
            ? [...state.royalUnlocks, ...newUnlocks]
            : state.royalUnlocks,
        };
      }
      return { ...state, xp: state.xp + action.amount };
    }

    case "EVOLVE": {
      if (state.stage === "royal") return state;
      const idx = STAGES.indexOf(state.stage);
      return { ...state, stage: STAGES[idx + 1] as CatStage, xp: 0 };
    }

    case "RECORD_RESIST":
      return { ...state, totalResists: state.totalResists + 1 };

    case "RECORD_TASK_COMPLETED":
      return { ...state, tasksCompleted: state.tasksCompleted + 1 };

    case "MARK_ACTIVITY": {
      const today = action.dateKey;
      if (state.lastActiveDate === today) return state;
      const newStreak =
        state.lastActiveDate === prevDayKey(today) ? state.streak + 1 : 1;
      return { ...state, streak: newStreak, lastActiveDate: today };
    }

    case "SET_NAME":
      return { ...state, name: action.name };

    default:
      return state;
  }
}

type PetContextValue = {
  pet: PetState;
  storeReady: boolean;
  dispatch: React.Dispatch<PetAction>;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pet, dispatch] = useReducer(petReducer, defaultState);
  const [storeReady, setStoreReady] = useState(false);

  // Phase 1: Load persisted state, then mark ready
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            dispatch({ type: "LOAD", payload: JSON.parse(raw) as Partial<PetState> });
          } catch {
            // Corrupted data — keep defaults
          }
        }
      })
      .catch(() => {})
      .finally(() => setStoreReady(true));
  }, []);

  // Phase 2: Persist ONLY after hydration to avoid overwriting real data
  useEffect(() => {
    if (!storeReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pet)).catch(() => {});
  }, [pet, storeReady]);

  return (
    <PetContext.Provider value={{ pet, storeReady, dispatch }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used within PetProvider");
  return ctx;
}
