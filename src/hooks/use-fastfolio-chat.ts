"use client";

import { useCallback, useRef, useState } from "react";

export type UIMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type UseChatOptions = {
  api?: string;
  onResponse?: () => void;
  onFinish?: () => void;
  onError?: (err: Error) => void;
};

// ✅ Your FastAPI backend endpoint
const HF_BACKEND_URL =
  "https://harsh123007-harshal-portfolio-ai.hf.space/chat";

let idCounter = 0;
const nextId = () => `msg_${idCounter++}`;

export function useChat(options: UseChatOptions = {}) {
  // ✅ Default to HF backend, not /api/chat
  const {
    api = HF_BACKEND_URL,
    onResponse,
    onFinish,
    onError,
  } = options;

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  // Used to ensure only the *latest* request runs in Strict Mode
  const requestIdRef = useRef(0);

  const stop = () => {
    if (abortRef.current) {
      abortRef.current.abort("stop");
      abortRef.current = null;
    }
    setIsLoading(false);
  };

  // Typing animation for assistant
  const typeOut = (text: string, base: UIMessage[]) => {
    const assistantId = nextId();

    setMessages([...base, { id: assistantId, role: "assistant", content: "" }]);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      const slice = text.slice(0, i);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: slice } : m
        )
      );

      if (i >= text.length) {
        clearInterval(interval);
        onFinish?.();
        setIsLoading(false);
      }
    }, 18);
  };

  const callBackend = async (allMsgs: UIMessage[], requestId: number) => {
    // If a newer request was started, ignore this one (Strict Mode safety)
    if (requestId !== requestIdRef.current) return;

    try {
      setIsLoading(true);
      onResponse?.();

      // Cancel previous in-flight request, if any
      if (abortRef.current) {
        try {
          abortRef.current.abort("new_request");
        } catch (e) {
          console.error("Error aborting previous request:", e);
        }
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const payload = {
        messages: allMsgs.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        keepalive: true,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const data = await res.json();

      const replyText: string =
        typeof data?.reply === "string" && data.reply.trim().length > 0
          ? data.reply
          : "Sorry, I couldn't think of a reply.";

      // Only type out if this is still the latest request
      if (requestId === requestIdRef.current) {
        typeOut(replyText, allMsgs);
      }
    } catch (err: any) {
      // Intentional aborts → ignore
      if (
        err === "new_request" ||
        err === "stop" ||
        err?.name === "AbortError"
      ) {
        console.log("Request aborted intentionally:", err);
        return;
      }

      console.error("Chat error:", err);
      onError?.(err instanceof Error ? err : new Error("Unknown error"));
      setIsLoading(false);
    } finally {
      if (requestId === requestIdRef.current) {
        abortRef.current = null;
      }
    }
  };

  const append = useCallback(
    (msg: { role: "user" | "assistant" | "system"; content: string }) => {
      const newMsg: UIMessage = {
        id: nextId(),
        role: msg.role,
        content: msg.content,
      };

      // We use the updater form to always get the latest messages
      setMessages((prev) => {
        const updated = [...prev, newMsg];

        if (msg.role === "user") {
          lastUserMessageRef.current = msg.content;

          // Increment global request ID and capture it locally
          const reqId = ++requestIdRef.current;

          // Start backend call AFTER state update, Strict-Mode safe
          // Even if React calls this updater twice, only the latest reqId survives.
          setTimeout(() => {
            void callBackend(updated, reqId);
          }, 0);
        }

        return updated;
      });
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    append({ role: "user", content: input.trim() });
    setInput("");
  };

  const reload = async () => {
    const last = lastUserMessageRef.current;
    if (!last) return;

    const newMsg: UIMessage = {
      id: nextId(),
      role: "user",
      content: last,
    };

    setMessages((prev) => {
      const filtered = prev.filter((m) => m.role !== "assistant");
      const updated = [...filtered, newMsg];

      const reqId = ++requestIdRef.current;
      setTimeout(() => {
        void callBackend(updated, reqId);
      }, 0);

      return updated;
    });
  };

  return {
    messages,
    input,
    handleInputChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setInput(e.target.value),
    handleSubmit,
    isLoading,
    stop,
    setInput,
    reload,
    append,
  };
}
