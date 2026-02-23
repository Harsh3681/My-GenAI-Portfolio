
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
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// const HF_BACKEND_URL =
//   process.env.HF_BACKEND_URL ??
//   "https://harsh123007-harshal-portfolio-ai.hf.space"; // ✅ lowercase

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

//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 120_000);

//     const hfRes = await fetch(backendUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify({ messages, stream: false }), // ✅ force non-stream
//       signal: controller.signal,
//       cache: "no-store",
//     }).finally(() => clearTimeout(timeout));

//     const raw = await hfRes.text().catch(() => "");

//     if (!hfRes.ok) {
//       return new Response(
//         JSON.stringify({
//           error: "Error from Harshal AI backend",
//           status: hfRes.status,
//           details: raw.slice(0, 1500),
//         }),
//         { status: 502, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Try to parse JSON, else treat as plain text
//     try {
//       const json = JSON.parse(raw);

//       // ✅ pick reply from MANY possible shapes
//       const reply =
//         json?.reply ??
//         json?.answer ??
//         json?.response ??
//         json?.output ??
//         json?.text ??
//         json?.message ??
//         json?.data?.reply ??
//         json?.data?.answer ??
//         "";

//       return new Response(JSON.stringify({ reply: String(reply ?? "").trim() }), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     } catch {
//       // HF returned plain text/HTML; still return something predictable
//       return new Response(JSON.stringify({ reply: raw.trim() }), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
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






// src/app/api/harshal-chat/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HF_BACKEND_URL =
  process.env.HF_BACKEND_URL ??
  "https://harsh123007-harshal-portfolio-ai.hf.space"; // ✅ lowercase

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const backendUrl = HF_BACKEND_URL.replace(/\/$/, "") + "/chat";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    // ✅ ONLY ONE fetch
    const hfRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ messages, stream: false }),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeout));

    const raw = await hfRes.text().catch(() => "");

    // ✅ DEBUG LOGS (server side)
    console.log("STATUS:", hfRes.status);
    console.log("CONTENT-TYPE:", hfRes.headers.get("content-type"));
    console.log("RAW:", raw.slice(0, 500));

    if (!hfRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Error from Harshal AI backend",
          status: hfRes.status,
          raw,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ parse JSON safely OR fallback to raw
    let json: any = {};
    try {
      json = JSON.parse(raw);
    } catch {
      json = { reply: raw };
    }

    const reply =
      json?.reply ??
      json?.answer ??
      json?.response ??
      json?.output ??
      json?.text ??
      json?.message ??
      "";

    return new Response(
      JSON.stringify({ reply: String(reply || "").trim() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
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