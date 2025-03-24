# Point.Less

Point.Less is an intelligent story pointing engine that leverages LLM capabilities to provide consistent and data-driven story point estimates for agile teams.

## Architecture

The system is built with a layered architecture that separates concerns and promotes maintainability:

For detailed architecture information, please see [ARCHITECTURE.md](ARCHITECTURE.md).


## Features

- Multiple LLM provider support (OpenAI, Anthropic, Google)
- Consistent story point estimation based on historical data
- Integration with popular project management tools
- Extensible architecture for custom integrations

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

## Usage Example

```typescript
import { PointLessEngine, PointLessEngineBuilder, LLMProvider } from '@pointless/engine';

// Configure the engine
const config = {
  provider: LLMProvider.OPENAI,
  apiKey: 'your-api-key',
  model: 'gpt-4o-mini'
};

// Create engine instance
const engine = new PointLessEngineBuilder(config).build();

// Get story points estimation
const result = await engine.point({
  referenceStories: [
    {
      content: 'As a user, I want to log in with my email',
      points: 2
    }
  ],
  story: {
    content: 'As a user, I want to reset my password'
  }
});

console.log(result.points); // Estimated points
console.log(result.reason); // Explanation for the estimation
```

## Project Structure

```
.
├── apps/                # Applications
│   └── example/         # Example implementation
└── packages/
    ├── engine/         # Core pointing engine
    ├── eslint-config/  # Shared ESLint configuration
    └── typescript-config/ # Shared TypeScript configuration
```

## License

MIT
