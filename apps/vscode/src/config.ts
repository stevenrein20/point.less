import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { ReferenceStory, StoryLocation } from "@pointless/types";

interface PointlessConfig {
  referenceStories: (ReferenceStory | StoryLocation)[];
  customInstructions?: string;
}

export class ConfigManager {
  private static CONFIG_FILE = ".pointless";

  static async loadConfig(workspaceFolder: string): Promise<PointlessConfig> {
    const configPath = path.join(workspaceFolder, this.CONFIG_FILE);

    try {
      if (fs.existsSync(configPath)) {
        const configContent = await fs.promises.readFile(configPath, "utf8");
        return JSON.parse(configContent);
      }
    } catch (error) {
      console.error("Error loading .pointless config:", error);
    }

    return { referenceStories: [], customInstructions: undefined };
  }

  static async getReferenceStories(): Promise<
    (ReferenceStory | StoryLocation)[]
  > {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      return [];
    }

    const config = await this.loadConfig(workspaceFolder);

    return config.referenceStories;
  }

  static async getCustomInstructions(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      return undefined;
    }

    const config = await this.loadConfig(workspaceFolder);
    return config.customInstructions;
  }
}
