# Point.Less VS Code Extension

A VS Code extension for AI-powered story point estimation, seamlessly integrated with Jira.

## Features

- Estimate story points for Jira issues directly from VS Code
- Configure OpenAI and Jira integration settings
- Store reference stories in a `.pointless` file for consistent estimations

## Requirements

- Visual Studio Code v1.85.0 or higher
- Jira account with API access
- OpenAI API key

## Extension Settings

This extension contributes the following settings:

- `pointless.openai.apiKey`: OpenAI API Key for story point estimation
- `pointless.jira.cloudId`: Jira cloud ID for Jira integration (optional)

## Usage

1. Install the extension
2. Configure the extension settings with your API keys
3. Use the command palette (Cmd/Ctrl + Shift + P) and search for:
   - `Point.Less: Estimate Story Points` to estimate points for a Jira issue
   - `Point.Less: Configure Settings` to update your configuration

## Reference Stories

The extension uses a `.pointless` file in your workspace to store reference stories for consistent estimations. This file is intended to be used to enhance the responses received from AI. A higher quality of the reference stories will result in more accurate point estimations. Below is an example of how the file should be structured:

```json
{
  "referenceStories": [
    {
      "source": "jira",
      "issue": "SCRUM-1"
    },
    {
      "title": "test-story",
      "content": "This is a test",
      "points": "1"
    }
  ],
  "customInstructions": "It should definitely be the same as test-story"
}
```
