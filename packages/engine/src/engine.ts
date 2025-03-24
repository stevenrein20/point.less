import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { z } from "zod";
import { Pointer, PointerRequest, PointerResponse } from "@pointless/types";

export class PointLessEngine extends Pointer {
  private llm: BaseLanguageModel;

  constructor(llm: BaseLanguageModel) {
    super();
    this.llm = llm;
  }

  async point(request: PointerRequest): Promise<PointerResponse> {
    const schema = z.object({
      points: z.number().describe("The points assigned to the story"),
      explanation: z
        .string()
        .describe("Explanation of why these points were assigned"),
    });

    if (this.llm.withStructuredOutput) {
      const prompt = await this.buildPrompt(request);
      return this.llm
        .withStructuredOutput(schema)
        .invoke(prompt) as unknown as PointerResponse;
    }

    throw new Error("LLM does not support structured output");
  }

  private async buildPrompt(request: PointerRequest): Promise<string> {
    const { referenceStories, story } = request;

    const referenceStoriesText = (referenceStories ?? [])
      .map(
        (ref) =>
          `Title: ${ref.title || "Untitled"}\nContent: ${ref.content}\nPoints: ${ref.points}`
      )
      .join("\n\n");

    return `Given the following reference stories and a new story, analyze the new story and assign points based on the reference stories.

Reference Stories:
${referenceStoriesText}

New Story:
Title: ${story.title || "Untitled"}
Content: ${story.content}

Please analyze the new story and assign points based on the reference stories. Consider the complexity, creativity, and overall impact of the story.`;
  }
}
