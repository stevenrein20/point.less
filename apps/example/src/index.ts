import "dotenv/config";
import {
  PointLessEngineBuilder,
  LLMProvider,
  OpenAIModel,
} from "@pointless/engine";
import { JiraAdapter } from "@pointless/jira-adapter";
import { PointLessOrchestrator } from "@pointless/orchestrator";

const openAIPointer = new PointLessEngineBuilder({
  provider: LLMProvider.OPENAI,
  apiKey: process.env.OPENAI_API_KEY || "",
  model: OpenAIModel.GPT_4_O_MINI,
}).build();

const localPointer = new PointLessEngineBuilder({
  provider: LLMProvider.LOCAL,
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "test",
}).build();

const storySource = new JiraAdapter();

async function main() {
  const orchestrator = new PointLessOrchestrator(localPointer, storySource);

  try {
    console.log("Analyzing story... please wait...");
    const result = await orchestrator.pointStory({
      referenceStories: [
        {
          title: "The Simple Bug Fix",
          content: "Fixed a typo in the login button text",
          points: 1,
        },
      ],
      story: {
        source: "jira",
        url: process.env.JIRA_URL || "",
        issue: "SCRUM-1",
        authorization: `Basic ${Buffer.from(
          process.env.JIRA_BASIC_AUTH || ""
        ).toString("base64")}`,
      },
    });
    console.log("\nAnalysis Result:");
    console.log(result);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

main().catch(console.error);
