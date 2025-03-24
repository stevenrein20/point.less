import type { ReferenceStory, Story } from "@pointless/types";

export enum LLMProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  LOCAL = "local",
}

export enum OpenAIModel {
  GPT_4_O_MINI = "gpt-4o-mini",
}

export interface BaseLLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

export interface LocalConfig extends BaseLLMConfig {
  provider: LLMProvider.LOCAL;
  model: string;
}

export interface OpenAIConfig extends BaseLLMConfig {
  provider: LLMProvider.OPENAI;
  model: OpenAIModel;
}

export interface AnthropicConfig extends BaseLLMConfig {
  provider: LLMProvider.ANTHROPIC;
  model: string;
}

export interface GoogleConfig extends BaseLLMConfig {
  provider: LLMProvider.GOOGLE;
  model: string;
}

export type LLMConfig =
  | LocalConfig
  | OpenAIConfig
  | AnthropicConfig
  | GoogleConfig;
