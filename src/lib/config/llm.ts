import OpenAI from "openai";

export const defaultModel = "openai-gpt-oss-120b";

function getClient() {
  const apiKey = process.env.DO_MODEL_ACCESS_KEY;
  if (!apiKey) {
    throw new Error("DO_MODEL_ACCESS_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://inference.do-ai.run/v1",
  });
}

export async function aiResponse(
  model: string,
  instructions: string,
  prompt: string,
) {
  const openAIClient = getClient();
  return openAIClient.responses.create({
    model: model || defaultModel,
    instructions,
    input: prompt,
  });
}

export async function aiCompletions(
  model: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
) {
  const openAIClient = getClient();
  return openAIClient.chat.completions.create({
    model: model || defaultModel,
    messages,
  });
}
