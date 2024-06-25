import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";

const script = "app/api/run-script/story-book.gpt";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { story, pages, path } = await request.json();

  // Example CLI command: gptscript ./story-book.gpt --story "A robot and human become friends" --pages 5 --path ./

  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --pages ${pages} --path ${path}`,
  };

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const run = await g.run(script, opts);

          run.on(RunEventType.Event, (data) => {
            controller.enqueue(
              encoder.encode(`event: ${JSON.stringify(data)}\n\n`)
            );
          });

          await run.text();
          controller.close();
        } catch (error: any) {
          controller.error(error);
          console.error("Error:", error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
