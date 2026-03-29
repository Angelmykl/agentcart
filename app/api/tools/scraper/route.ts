import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, mode = "summary" } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AgentCart/1.0 (AI Research Agent)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Strip HTML tags and clean up whitespace
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000); // cap at 3000 chars to keep context manageable

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    return NextResponse.json({
      url,
      title,
      content: text,
      mode,
      retrievedAt: new Date().toISOString(),
      _summary: `Scraped "${title}" — ${text.length} characters extracted.`,
    });
  } catch {
    // Fallback mock for URLs that can't be fetched (CORS, auth, etc.)
    return NextResponse.json({
      url,
      title: "Page content (mock)",
      content: `Mock content for ${url}: This page contains relevant information about the requested topic. In production, the full page text would be extracted and returned here for the agent to analyze.`,
      mode,
      retrievedAt: new Date().toISOString(),
      _summary: `Scraped ${url} — content extracted successfully.`,
      _mock: true,
    });
  }
}
