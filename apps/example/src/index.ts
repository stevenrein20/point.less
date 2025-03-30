import { configDotenv } from "dotenv";
import { PointLessEngineBuilder, LLMProvider } from "@pointless/engine";
import { JiraAdapter } from "@pointless/jira-adapter";
import { PointLessOrchestrator } from "@pointless/orchestrator";
import axios from "axios";

configDotenv();

const localPointer = new PointLessEngineBuilder({
  provider: LLMProvider.LOCAL,
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "test",
}).build();

async function main() {
  try {
    console.log("Analyzing story... please wait...");

    const storySource = new JiraAdapter((path, config) => {
      return axios.get(`${process.env.JIRA_URL}${path}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.JIRA_BASIC_AUTH || ""
          ).toString("base64")}`,
        },
        ...config,
      });
    });

    const orchestrator = new PointLessOrchestrator(localPointer, storySource);

    const result = await orchestrator.pointStory({
      referenceStories: [
        {
          title: "The Simple Bug Fix",
          content: "Fixed a typo in the login button text",
          points: 1,
        },
      ],
      customInstructions: "All stories should be 5 points.",
      story: {
        source: "jira",
        issue: "SCRUM-1",
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
