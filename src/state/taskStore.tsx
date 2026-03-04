import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROYAL_TASK_PACKS } from "../domain/rewards";

export type Task = {
  id: string;
  title: string;
  description: string;
  xp: number;
  isCompleted: boolean;
  /** True once XP has been awarded for this task; prevents re-award on un-check/re-check. */
  xpAwarded: boolean;
  dateKey: string;  // YYYY-MM-DD
  isCustom: boolean;
};

/**
 * Default daily task templates. Generated fresh each day with IDs
 * prefixed by dateKey so they're unique per day. Custom tasks are
 * per-day only (isCustom=true) and do not repeat.
 */
const DEFAULT_TASK_TEMPLATES = [
  {
    suffix: "delay",
    title: "Delay a compulsion for 2 min",
    description: "When you feel the urge, wait just 2 minutes before acting.",
    xp: 15,
  },
  {
    suffix: "name",
    title: "Name your feeling",
    description: "When anxiety rises, say out loud what you're noticing.",
    xp: 10,
  },
  {
    suffix: "breath",
    title: "5 deep breaths",
    description: "Take 5 slow, deep breaths. In through the nose, out through the mouth.",
    xp: 10,
  },
  {
    suffix: "cold",
    title: "Touch something cold",
    description: "Hold ice or cold water for 30 seconds to ground yourself.",
    xp: 10,
  },
];

function generateDailyTasks(dateKey: string): Task[] {
  return DEFAULT_TASK_TEMPLATES.map((t) => ({
    id: `${dateKey}_${t.suffix}`,
    title: t.title,
    description: t.description,
    xp: t.xp,
    isCompleted: false,
    xpAwarded: false,
    dateKey,
    isCustom: false,
  }));
}

type TaskState = {
  tasks: Task[];
  /** dateKey on which the all-tasks bonus was last awarded (prevent double-award). */
  bonusAwardedDate: string | null;
};

export type TaskAction =
  | { type: "LOAD"; payload: TaskState }
  | { type: "ENSURE_DAILY"; dateKey: string; royalUnlocks?: string[] }
  | { type: "TOGGLE_TASK"; id: string }
  | { type: "MARK_TASK_XP_AWARDED"; id: string }
  | { type: "DELETE_TASK"; id: string }
  | { type: "ADD_CUSTOM"; task: Task }
  | { type: "SET_BONUS_DATE"; dateKey: string };

const STORAGE_KEY = "@calma/tasks";
const defaultState: TaskState = { tasks: [], bonusAwardedDate: null };

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "ENSURE_DAILY": {
      const { dateKey, royalUnlocks = [] } = action;
      const existingIds = new Set(
        state.tasks.filter((t) => t.dateKey === dateKey && !t.isCustom).map((t) => t.id)
      );
      const newTasks: Task[] = [];

      // Default daily tasks (only if none exist yet for today)
      if (existingIds.size === 0) {
        newTasks.push(...generateDailyTasks(dateKey));
      }

      // Royal unlock task packs — add any pack tasks not yet present
      for (const unlockId of royalUnlocks) {
        const pack = ROYAL_TASK_PACKS[unlockId];
        if (!pack) continue;
        for (const template of pack) {
          const id = `${dateKey}_${template.suffix}`;
          if (!existingIds.has(id)) {
            newTasks.push({
              id,
              title: template.title,
              description: template.description,
              xp: template.xp,
              isCompleted: false,
              xpAwarded: false,
              dateKey,
              isCustom: false,
            });
          }
        }
      }

      if (newTasks.length === 0) return state;
      return { ...state, tasks: [...state.tasks, ...newTasks] };
    }

    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      };

    case "MARK_TASK_XP_AWARDED":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, xpAwarded: true } : t
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
      };

    case "ADD_CUSTOM":
      return { ...state, tasks: [...state.tasks, action.task] };

    case "SET_BONUS_DATE":
      return { ...state, bonusAwardedDate: action.dateKey };

    default:
      return state;
  }
}

type TaskContextValue = {
  tasks: Task[];
  bonusAwardedDate: string | null;
  storeReady: boolean;
  dispatch: React.Dispatch<TaskAction>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, defaultState);
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            dispatch({ type: "LOAD", payload: JSON.parse(raw) as TaskState });
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setStoreReady(true));
  }, []);

  useEffect(() => {
    if (!storeReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, storeReady]);

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        bonusAwardedDate: state.bonusAwardedDate,
        storeReady,
        dispatch,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
