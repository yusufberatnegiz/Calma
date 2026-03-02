import React, { createContext, useContext, useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MoodValue = 1 | 3 | 5;

export type DailyLog = {
  dateKey: string;           // YYYY-MM-DD
  dayRating?: MoodValue;
  compulsionCount?: number;
  selectedTypes?: string[];
  notes?: string;
  updatedAt: string;         // ISO string
};

type LogState = {
  logs: Record<string, DailyLog>; // keyed by dateKey
};

type LogAction =
  | { type: "LOAD"; payload: LogState }
  | { type: "SAVE_LOG"; log: DailyLog };

const STORAGE_KEY = "@calma/logs";
const defaultState: LogState = { logs: {} };

function logReducer(state: LogState, action: LogAction): LogState {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "SAVE_LOG":
      return {
        ...state,
        logs: { ...state.logs, [action.log.dateKey]: action.log },
      };
    default:
      return state;
  }
}

type LogContextValue = {
  logs: Record<string, DailyLog>;
  dispatch: React.Dispatch<LogAction>;
};

const LogContext = createContext<LogContextValue | null>(null);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(logReducer, defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            dispatch({ type: "LOAD", payload: JSON.parse(raw) as LogState });
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  return (
    <LogContext.Provider value={{ logs: state.logs, dispatch }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error("useLogs must be used within LogProvider");
  return ctx;
}
