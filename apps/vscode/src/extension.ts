import * as vscode from "vscode";
import {
  PointLessEngineBuilder,
  LLMProvider,
  OpenAIModel,
} from "@pointless/engine";
import { JiraAdapter } from "@pointless/jira-adapter";
import { PointLessOrchestrator } from "@pointless/orchestrator";
import { ConfigManager } from "./config";
import { JiraAuthenticationProvider } from "./auth/jiraAuthProvider";
import axios from "axios";
import { Story, StoryLocation } from "@pointless/types";

export function activate(context: vscode.ExtensionContext) {
  const jiraAuthProvider = new JiraAuthenticationProvider(context);
  context.subscriptions.push(jiraAuthProvider);

  let disposable = vscode.commands.registerCommand(
    "pointless.estimate",
    async () => {
      const config = vscode.workspace.getConfiguration("pointless");
      const openaiApiKey = config.get<string>("openai.apiKey");

      if (!openaiApiKey) {
        vscode.window.showErrorMessage(
          "Please configure OpenAI API Key in Point.Less settings first"
        );
        return;
      }

      const storySource = await vscode.window.showQuickPick(
        [
          {
            label: "Custom Story",
            description: "Enter a custom story title and content",
          },
          { label: "Jira Issue", description: "Use an existing Jira issue" },
        ],
        { placeHolder: "Select story source" }
      );

      if (!storySource) return;

      const referenceStories = await ConfigManager.getReferenceStories();
      const customInstructions = await ConfigManager.getCustomInstructions();

      let story: Story | StoryLocation;
      if (storySource.label === "Custom Story") {
        const title = await vscode.window.showInputBox({
          prompt: "Enter story title",
          placeHolder: "Story title",
        });
        if (!title) return;

        const content = await vscode.window.showInputBox({
          prompt: "Enter story content",
          placeHolder: "Story description",
        });
        if (!content) return;

        story = { title, content };
      } else {
        const issueKey = await vscode.window.showInputBox({
          prompt: "Enter Jira issue key (e.g. SCRUM-123)",
          placeHolder: "SCRUM-123",
        });

        if (!issueKey) return;

        story = {
          source: "jira" as const,
          issue: issueKey,
        };
      }

      try {
        const engine = new PointLessEngineBuilder({
          provider: LLMProvider.OPENAI,
          apiKey: openaiApiKey,
          model: OpenAIModel.GPT_4_O_MINI,
        }).build();

        let jiraAdapter: JiraAdapter;
        if (
          (story as StoryLocation).source ||
          referenceStories.some((ref) => (ref as StoryLocation).source)
        ) {
          const session = await vscode.authentication.getSession(
            "jira",
            ["read:jira-work", "write:jira-work", "read:me"],
            { createIfNone: true }
          );

          const jiraCloudId = await getJiraCloudId(config, session);
          if (!jiraCloudId) return;

          jiraAdapter = new JiraAdapter(async (path: string, other: object) => {
            const response = await axios.get(
              `https://api.atlassian.com/ex/jira/${jiraCloudId}${path}`,
              {
                ...other,
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                  Accept: "application/json",
                },
              }
            );

            return response;
          });
        } else {
          jiraAdapter = new JiraAdapter(async (_: string, __: object) => {
            throw new Error("Jira adapter not initialized");
          });
        }

        const orchestrator = new PointLessOrchestrator(engine, jiraAdapter);

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Estimating story points...",
            cancellable: false,
          },
          async () => {
            const request = {
              story,
              referenceStories,
              customInstructions,
            };

            const result = await orchestrator.pointStory(request);

            vscode.window.showInformationMessage(
              `Estimated story points: ${result.points}\n\nReasoning: ${result.explanation}`
            );
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error estimating story points: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  );

  let configureDisposable = vscode.commands.registerCommand(
    "pointless.configure",
    () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "pointless"
      );
    }
  );

  context.subscriptions.push(disposable, configureDisposable);
}

export async function getJiraCloudId(
  config: vscode.WorkspaceConfiguration,
  session: vscode.AuthenticationSession
) {
  if (config.get<string>("jira.cloudId")) {
    return config.get<string>("jira.cloudId");
  }

  try {
    const response = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data.length === 0) {
      vscode.window.showErrorMessage(
        "No Jira Cloud instances found for your account"
      );
      return undefined;
    } else if (response.data.length === 1) {
      await config.update("jira.cloudId", response.data[0].id, true);
      return response.data[0].id;
    } else {
      const cloudInstances = response.data.map((instance: any) => ({
        label: instance.name,
        description: instance.url,
        id: instance.id,
      }));

      const selected = (await vscode.window.showQuickPick(cloudInstances, {
        placeHolder: "Select your Jira Cloud instance",
      })) as unknown as
        | { label: string; description: string; id: string }
        | undefined;

      if (!selected) return undefined;

      await config.update("jira.cloudId", selected.id as string, true);

      return selected.id;
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error fetching Jira Cloud instances: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return undefined;
  }
}

export function deactivate() {}
