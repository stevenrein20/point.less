import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PointLessRequest,
  ReferenceStory,
  Story,
  StoryLocation,
} from "@pointless/types";

type PointLessState = Partial<PointLessRequest> & {
  setStory: (story: Story | StoryLocation | undefined) => void;
  setReferenceStories: (stories: Array<ReferenceStory | StoryLocation>) => void;
  setCustomInstructions: (instructions: string) => void;
  reset: () => void;
};

const initialState = {
  story: undefined,
  referenceStories: [],
  customInstructions: "",
};

export const usePointLessStore = create<PointLessState>()(
  persist<PointLessState>(
    (set) => ({
      ...initialState,
      setStory: (story) => set({ story }),
      setReferenceStories: (stories) => set({ referenceStories: stories }),
      setCustomInstructions: (instructions) =>
        set({ customInstructions: instructions }),
      reset: () => set(initialState),
    }),
    {
      name: "pointless-storage",
    }
  )
);
