import React, { createContext, useContext, useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CatStage, prevDayKey } from "../domain/rewards";

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
};

export type PetAction =
  | { type: "LOAD"; payload: PetState }
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
};

function petReducer(state: PetState, action: PetAction): PetState {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "ADD_XP":
      return { ...state, xp: state.xp + action.amount };

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
  dispatch: React.Dispatch<PetAction>;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pet, dispatch] = useReducer(petReducer, defaultState);

  // Load persisted state once on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            dispatch({ type: "LOAD", payload: JSON.parse(raw) as PetState });
          } catch {
            // Corrupted data — use defaults
          }
        }
      })
      .catch(() => {});
  }, []);

  // Persist on every change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pet)).catch(() => {});
  }, [pet]);

  return (
    <PetContext.Provider value={{ pet, dispatch }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used within PetProvider");
  return ctx;
}
