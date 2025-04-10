import { PointLessResponse } from "@pointless/types";
import { PointLessOrchestrator } from "@pointless/orchestrator";
import { JiraAdapter } from "@pointless/jira-adapter";
import {
  LLMProvider,
  OpenAIModel,
  PointLessEngineBuilder,
} from "@pointless/engine";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Initialize the Jira adapter with environment variables
  const jiraAdapter = new JiraAdapter(); // TODO create this.

  // Initialize the Pointless engine
  const engine = new PointLessEngineBuilder({
    apiKey: process.env.OPENAI_API_KEY || "",
    provider: LLMProvider.OPENAI,
    model: OpenAIModel.GPT_4_O_MINI,
  }).build();
  // Create the orchestrator with the initialized components
  const orchestrator = new PointLessOrchestrator(engine, jiraAdapter);

  // Process the request
  const response: PointLessResponse = await orchestrator.pointStory(request);
  console.log("[point] Successfully processed request");

  return NextResponse.json(response);
}
