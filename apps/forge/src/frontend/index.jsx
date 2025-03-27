import React, { useState, useEffect } from "react";
import ForgeReconciler, {
  Text,
  Button,
  useProductContext,
  Form,
  Label,
  Textfield,
  TextArea,
  Select,
  Spinner,
} from "@forge/react";
import { requestJira as request } from "@forge/bridge";
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

const pointStory = async ({ apiKey, ...data }) => {
  const openAIPointer = new PointLessEngineBuilder({
    provider: LLMProvider.OPENAI,
    model: OpenAIModel.GPT_4_O_MINI,
    apiKey: apiKey,
  }).build();

  const storySource = new JiraAdapter(requestJira);

  const orchestrator = new PointLessOrchestrator(openAIPointer, storySource);

  return await orchestrator.pointStory(data);
};

const App = () => {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: "",
    referenceStories: [],
    customInstructions: "",
  });
  const [availableStories, setAvailableStories] = useState([]);
  const context = useProductContext();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await request("/rest/api/3/search?jql=type=Story", {
          method: "GET",
        });
        const data = await response.json();

        setAvailableStories(
          data.issues
            .filter((issue) => issue.key !== context?.extension?.issue?.id)
            .map((issue) => ({ label: issue.key, value: issue.key }))
        );
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };
    fetchStories();
  }, []);

  const handlePointStory = async () => {
    const issue = context?.extension?.issue?.key;

    if (issue) {
      setIsLoading(true);
      try {
        const { points, explanation } = await pointStory({
          story: { source: "jira", issue },
          apiKey: settings.apiKey,
          referenceStories: settings.referenceStories.map((story) => ({
            source: "jira",
            issue: story.value,
          })),
          customInstructions: settings.customInstructions,
        });

        // Fetch all fields to find the story points field
        const { data: fieldsData } = await requestJira(
          "/rest/api/3/field/search?query=point"
        );

        // Update the story points in Jira using the discovered fields
        requestJira(`/rest/api/3/issue/${issue}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: { [fieldsData.values[0].id]: points },
          }),
        });

        setMessage(
          `I'd recommend this story as ${points} points. \n\nExplanation: ${explanation}\n\nStory points have been updated in Jira.`
        );
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return isLoading ? (
    <Spinner />
  ) : message ? (
    <>
      <Text>{message}</Text>
      <Button
        type="button"
        onClick={() => setMessage(null)}
        appearance="primary"
      >
        Back
      </Button>
    </>
  ) : (
    <>
      <Form onSubmit={handlePointStory}>
        <Label>OpenAI API Key</Label>
        <Textfield
          label="OpenAI API Key for Story Point Analysis"
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          isRequired
          validationState={settings.apiKey ? "default" : "error"}
          errorMessage={settings.apiKey ? "" : "API Key is required"}
        />
        <Label>Reference Stories</Label>
        <Select
          label="Reference Stories for Calibration"
          isMulti
          options={availableStories}
          value={settings.referenceStories}
          onChange={(values) =>
            setSettings({ ...settings, referenceStories: values })
          }
        />
        <Label>Custom Instructions</Label>
        <TextArea
          label="Custom Story Pointing Instructions"
          value={settings.customInstructions}
          onChange={(e) =>
            setSettings({ ...settings, customInstructions: e.target.value })
          }
          placeholder="Example: Consider technical complexity and team velocity when pointing stories"
        />
        <Button type="submit" appearance="primary" spacing="4">
          Point Story
        </Button>
      </Form>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
