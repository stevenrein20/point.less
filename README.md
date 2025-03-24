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

- Multiple LLM provider support (OpenAI, Anthropic, Google)
- Consistent story point estimation based on historical data
- Native Jira integration for seamless workflow
- Extensible adapter architecture for custom integrations
- Type-safe API with comprehensive TypeScript support

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
│   └── example/         # Example implementation
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
