"use server";

import { PointLessRequest, PointLessResponse } from "@pointless/types";
import { PointLessOrchestrator } from "@pointless/orchestrator";
import { JiraAdapter } from "@pointless/jira-adapter";
import {
  LLMProvider,
  OpenAIModel,
  PointLessEngineBuilder,
} from "@pointless/engine";
import { getServerSession } from "next-auth";
import axios from "axios";
import { authOptions } from "@/app/auth";

export async function pointStoryAction(
  pointlessRequest: PointLessRequest,
  jira: { instance: string; accessToken: string }
): Promise<PointLessResponse | void> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const jiraAdapter = new JiraAdapter(async (path: string, other: object) => {
      const response = await axios.get(
        `https://api.atlassian.com/ex/jira/${jira.instance}${path}`,
        {
          ...other,
          headers: {
            Authorization: `Bearer ${jira.accessToken}`,
            Accept: "application/json",
          },
        }
      );
      return response;
    });

    const engine = new PointLessEngineBuilder({
      apiKey: process.env.OPENAI_API_KEY || "",
      provider: LLMProvider.OPENAI,
      model: OpenAIModel.GPT_4_O_MINI,
    }).build();

    const orchestrator = new PointLessOrchestrator(engine, jiraAdapter);
    return await orchestrator.pointStory(pointlessRequest);
  } catch (error) {
    console.error("[point] Processing error:", error);
  }
}
