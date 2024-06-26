import { NextRequest, NextResponse } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";
import path from "path";

const script = path.join(process.cwd(), "app/api/run-script/story-book.gpt");

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  console.log("API request received:", request.url);

  try {
    const { story, pages, path: filePath } = await request.json();

    console.log("Request body:", { story, pages, filePath });

    const opts: RunOpts = {
      disableCache: true,
      input: `--story ${story} --pages ${pages} --path ${filePath}`,
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Running GPTScript instance...");
          const run = await g.run(script, opts);

          run.on(RunEventType.Event, (data) => {
            controller.enqueue(
              encoder.encode(`event: ${JSON.stringify(data)}\n\n`)
            );
          });

          await run.text();
          controller.close();
        } catch (error) {
          console.error("Error running GPTScript instance:", error);
          controller.error(error);
        }
      },
    });

    const response = new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });

    console.log("API response sent:", response.status);

    return response;
  } catch (error: any) {
    console.error("API error:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
