import React, { createContext, useContext, useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PanicOutcome = "resisted" | "partial" | "compulsion";

export type PanicSession = {
  id: string;
  startedAt: string;   // ISO string
  endedAt: string;     // ISO string
  durationSec: number; // seconds the timer ran
  urgeRating: number;  // 1–10
  outcome: PanicOutcome;
  xpAwarded: number;
};

type SessionState = {
  sessions: PanicSession[];
};

type SessionAction =
  | { type: "LOAD"; payload: SessionState }
  | { type: "ADD_SESSION"; session: PanicSession };

const STORAGE_KEY = "@calma/sessions";
const defaultState: SessionState = { sessions: [] };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "ADD_SESSION":
      return { ...state, sessions: [...state.sessions, action.session] };
    default:
      return state;
  }
}

type SessionContextValue = {
  sessions: PanicSession[];
  dispatch: React.Dispatch<SessionAction>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            dispatch({ type: "LOAD", payload: JSON.parse(raw) as SessionState });
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  return (
    <SessionContext.Provider value={{ sessions: state.sessions, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessions must be used within SessionProvider");
  return ctx;
}
