import { create } from "zustand";
import { persist } from "zustand/middleware";

type JiraState = {
  instance?: string;
  accessToken?: string;
  expiresAt?: number;
  isAuthenticated: () => boolean;
  setAuth: (auth: {
    instance?: string;
    accessToken?: string;
    expiresAt?: number;
  }) => void;
  reset: () => void;
};

const initialState = {
  instance: undefined,
  accessToken: undefined,
  expiresAt: undefined,
};

export const useJiraStore = create<JiraState>()(
  persist<JiraState>(
    (set, get) => ({
      ...initialState,
      setAuth: (auth) => set(auth),
      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;

        if (expiresAt <= Date.now()) {
          set(initialState);

          return false;
        }

        return true;
      },
      reset: () => set(initialState),
    }),
    {
      name: "jira-storage",
    }
  )
);
