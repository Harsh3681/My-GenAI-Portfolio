
// src/app/api/harshal-chat/route.ts

// const HF_BACKEND_URL =
//   process.env.HF_BACKEND_URL ??
//   "https://harsh123007-harshal-portfolio-ai.hf.space"; // keep lowercase

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { messages } = body || {};

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return new Response(JSON.stringify({ error: "messages array is required" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const backendUrl = HF_BACKEND_URL.replace(/\/$/, "") + "/chat";

//     const hfRes = await fetch(backendUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ messages }),
//     });

//     const text = await hfRes.text(); // ALWAYS read as text first

//     if (!hfRes.ok) {
//       return new Response(
//         JSON.stringify({
//           error: "Error from Harshal AI backend",
//           status: hfRes.status,
//           details: text?.slice(0, 2000),
//         }),
//         { status: 502, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Try JSON parse; if HF returned HTML, this won't crash anymore
//     try {
//       const data = JSON.parse(text);
//       return new Response(JSON.stringify(data), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     } catch {
//       // HF returned non-JSON (sleep page / html)
//       return new Response(
//         JSON.stringify({
//           error: "Harshal AI backend returned non-JSON (Space may be sleeping).",
//           details: text?.slice(0, 500),
//         }),
//         { status: 503, headers: { "Content-Type": "application/json" } }
//       );
//     }
//   } catch (err: any) {
//     return new Response(
//       JSON.stringify({
//         error: "Internal server error in /api/harshal-chat",
//         details: err?.message ?? String(err),
//       }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

// ------------------------------------------------------------

// src/app/api/harshal-chat/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HF_BACKEND_URL =
  process.env.HF_BACKEND_URL ??
  "https://Harsh123007-harshal-portfolio-ai.hf.space";

export async function POST(req: Request) {
  try {
    const body = await req.text(); // IMPORTANT: keep raw body

    const backendUrl = HF_BACKEND_URL.replace(/\/$/, "") + "/chat";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const hfRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream", // IMPORTANT
        "Cache-Control": "no-cache",
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeout));

    if (!hfRes.ok) {
      const text = await hfRes.text();
      return new Response(
        JSON.stringify({
          error: "Error from Harshal AI backend",
          status: hfRes.status,
          details: text,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🚀 STREAM DIRECTLY FROM HF → CLIENT
    return new Response(hfRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Internal server error in /api/harshal-chat",
        details: err?.message ?? String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}