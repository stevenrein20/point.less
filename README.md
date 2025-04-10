# Point.Less

Point.Less is an intelligent story pointing engine that leverages LLM capabilities to provide consistent and data-driven story point estimates for agile teams.

## Architecture

The system is built with a layered architecture that separates concerns and promotes maintainability:

- **Engine**: Core pointing engine that processes stories and generates estimates
- **Types**: Shared type definitions and interfaces
- **Jira Adapter**: Integration with Jira for fetching and processing stories
- **Orchestrator**: Coordinates the workflow between different components

For detailed architecture information, please see [ARCHITECTURE.md](ARCHITECTURE.md).

## Features

- Consistent story point estimation based on historical data
- Native Jira integration for seamless workflow
- Extensible adapter architecture for custom integrations
- Type-safe API with comprehensive TypeScript support
- VS Code Extension with Jira OAuth integration
- `.pointless` configuration system for reference stories and custom instructions
- LLM provider abstraction layer (OpenAI implemented, Anthropic and Google in progress)

## Roadmap

- Deliver REST API and Independent front-end (somehow "billthrough" for AI features??). I will set this up so I am hosting as a service for others to use, then other options to make use of my system can be self service rn, but this one will be a paid or billthrough service. 
- Single API endpoint to point. It will use the same existing request and response format but will have auth through my own auth (Auth0), then we will do third party integration with Jira. API is one endpoint, UI allows for .pointless file upload and simple modification and download.
- Complete multiple LLM provider support (Anthropic, Google)
- Enhanced .pointless file creation system (Should look at all completed issues and try to identify accurately pointed ones along with the user. This process should allow the user refine the .pointless config along with an AI. (approve/deny pointing accuracy. Suggest and refine a custom instruction) Probably web only feature)
- Improved documentation for better developer onboarding

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Build all packages
pnpm build

# Start development mode
pnpm dev

# Run linting
pnpm lint
```

## Project Structure

```
.
├── apps/                # Applications
│   ├── example/        # Example implementation
│   ├── forge/          # Atlassian Forge app
│   └── vscode/         # VS Code extension
└── packages/
    ├── engine/         # Core pointing engine
    ├── types/          # Shared type definitions
    ├── jira-adapter/   # Jira integration
    ├── orchestrator/   # Workflow coordination
    ├── eslint-config/  # Shared ESLint configuration
    └── typescript-config/ # Shared TypeScript configuration
```

## License

MIT
