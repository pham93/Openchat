import OpenAI from "openai";

export type OpenRouterRequest = Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  "model"
>;

export interface ILipSync {
  metadata: {
    soundFile: string;
    duration: number;
  };
  mouthCues: {
    start: number;
    end: number;
    value: string;
    animation?: string;
  }[];
}

export interface IChatResponse {
  lipsync: ILipSync;
  audio: string;
  history: NonNullable<OpenRouterRequest["messages"]>;
}
