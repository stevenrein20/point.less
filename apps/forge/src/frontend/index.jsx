import React, { useState } from "react";
import ForgeReconciler, { Text } from "@forge/react";
import { requestJira as request } from "@forge/bridge";
import PointForm from "./components/PointForm";
import {
  PointLessEngineBuilder,
  LLMProvider,
  OpenAIModel,
} from "@pointless/engine";
import { JiraAdapter } from "@pointless/jira-adapter";
import { PointLessOrchestrator } from "@pointless/orchestrator";

const requestJira = async (path, options = {}) => {
  const response = await request(path, options);

  return { data: await response.json() };
};

const pointStory = async (formData) => {
  const openAIPointer = new PointLessEngineBuilder({
    provider: LLMProvider.OPENAI,
    apiKey: formData.openAIAPIKey,
    model: OpenAIModel.GPT_4_O_MINI,
  }).build();

  const storySource = new JiraAdapter(requestJira);

  const orchestrator = new PointLessOrchestrator(openAIPointer, storySource);

  return await orchestrator.pointStory({
    referenceStories: [
      {
        title: "The Simple Bug Fix",
        content: "Fixed a typo in the login button text",
        points: 1,
      },
    ],
    customInstructions: "All stories should be 5 points.",
    story: formData.story,
  });

}

// TODO => add loading spinner
// TODO => add error handling
// TODO => clean up the UI
// TODO => Make it so the reference stories, instruction and API key are handled through some configurati, not right in the UI.
// TODO => Make it so the story points are written to the Jira story, not just logged.
const App = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { points, explanation } = await pointStory(formData);
      setData(`Points: ${points}\n\nExplanation: ${explanation}`);
    } catch (error) {
      setData(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PointForm onSubmit={handleSubmit} isLoading={isLoading}  />
      {data && <Text>{data}</Text>}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
