"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DebugEventType =
  | "system"
  | "navigation"
  | "player"
  | "library"
  | "error"
  | "network";

export type DebugEvent = {
  id: string;
  type: DebugEventType;
  message: string;
  timestamp: number;
  data?: string;
};

type DebugContextValue = {
  events: DebugEvent[];
  enabled: boolean;
  log: (
    type: DebugEventType,
    message: string,
    data?: unknown,
  ) => void;
  clearEvents: () => void;
  toggleDebug: () => void;
};

const DebugContext =
  createContext<DebugContextValue | null>(null);

function serialize(data: unknown) {
  if (data === undefined) {
    return undefined;
  }

  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

export function DebugProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [enabled, setEnabled] = useState(true);

  const log = useCallback((
    type: DebugEventType,
    message: string,
    data?: unknown,
  ) => {
    if (!enabled) {
      return;
    }

    const event: DebugEvent = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      type,
      message,
      timestamp: Date.now(),
      data: serialize(data),
    };

    setEvents((current) =>
      [event, ...current].slice(0, 100),
    );
  }, [enabled]);

  function clearEvents() {
    setEvents([]);
  }

  function toggleDebug() {
    setEnabled((value) => !value);
  }

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      log(
        "error",
        event.message || "Unhandled browser error",
        {
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
        },
      );
    };

    const handleRejection = (
      event: PromiseRejectionEvent,
    ) => {
      log(
        "error",
        "Unhandled promise rejection",
        String(event.reason),
      );
    };

    window.addEventListener(
      "error",
      handleError,
    );

    window.addEventListener(
      "unhandledrejection",
      handleRejection,
    );

    return () => {
      window.removeEventListener(
        "error",
        handleError,
      );

      window.removeEventListener(
        "unhandledrejection",
        handleRejection,
      );
    };
  }, [log]);

  return (
    <DebugContext.Provider
      value={{
        events,
        enabled,
        log,
        clearEvents,
        toggleDebug,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);

  if (!context) {
    throw new Error(
      "useDebug must be used inside DebugProvider",
    );
  }

  return context;
}
