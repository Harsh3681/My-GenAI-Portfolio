"use client";

import { useCallback, useState } from "react";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export function useHarshalChat(initial: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || isLoading) return;

      const history: ChatMessage[] = [
        ...messages,
        { role: "user", content: text },
      ];

      setMessages(history);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("https://harsh123007-harshal-portfolio-ai.hf.space/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.body) {
          throw new Error("Empty response body");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let assistantText = "";
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (!value) continue;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (typeof json.delta === "string") {
                assistantText += json.delta;
              }
            } catch {
              // ignore bad lines
            }
          }

          // update live streaming text
          setMessages([
            ...history,
            { role: "assistant", content: assistantText },
          ]);
        }

        setIsLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Something went wrong");
        setIsLoading(false);
      }
    },
    [input, messages, isLoading]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
  };
}
