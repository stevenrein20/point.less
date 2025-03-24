import { ChatOpenAI } from "@langchain/openai";
import {
  BaseLanguageModel,
  BaseLanguageModelParams,
} from "@langchain/core/language_models/base";
import { LLMConfig, OpenAIConfig } from "./types";
import { PointLessEngine } from "./engine";

export class PointLessEngineBuilder {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  private createLLM(): BaseLanguageModel {
    switch (this.config.provider) {
      case "openai": {
        const openaiConfig = this.config as OpenAIConfig;
        return new ChatOpenAI({
          apiKey: openaiConfig.apiKey,
          model: openaiConfig.model,
        });
      }
      case "anthropic": {
        throw new Error("Anthropic support is not implemented yet");
      }
      case "google": {
        throw new Error("Google support is not implemented yet");
      }
      case "local": {
        // @ts-ignore
        class LocalLLM extends BaseLanguageModel {
          constructor(params: BaseLanguageModelParams) {
            super(params);
          }
          async invoke(prompt: string): Promise<string> {
            return "cats";
          }

          withStructuredOutput(...all: unknown[]): any {
            return this;
          }
        }

        return new LocalLLM({});
      }
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  build(): PointLessEngine {
    const llm = this.createLLM();
    return new PointLessEngine(llm);
  }
}
