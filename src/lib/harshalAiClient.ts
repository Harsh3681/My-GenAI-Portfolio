// lib/harshalAiClient.ts

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function sendToHarshalAI(
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch("/api/harshal-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("sendToHarshalAI error:", error);
    throw new Error(error?.error || "Failed to call Harshal AI backend");
  }

  const data = await res.json(); // { reply: string }
  return data.reply;
}
