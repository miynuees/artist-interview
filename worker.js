// Cloudflare Worker — Anthropic API 프록시
// 배포 방법은 같은 폴더의 "배포방법.md" 참고

// 허용할 출처(Origin). 배포한 사이트 주소를 넣어줘.
// 여러 개면 배열에 추가. 전부 허용하려면 ["*"].
const ALLOWED_ORIGINS = ["*"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowOrigin = ALLOWED_ORIGINS.includes("*")
      ? "*"
      : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405, headers: corsHeaders });
    }

    const body = await request.text();

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const respBody = await upstream.text();
    return new Response(respBody, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  },
};
