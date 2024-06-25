import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";
import { join } from "path";
import fs from "fs";

const script = "app/api/run-script/story-book.gpt";

// Determine the path to the gptscript binary dynamically
const gptScriptPath = join(
  process.cwd(),
  "node_modules",
  "@gptscript-ai",
  "gptscript",
  "bin",
  "gptscript"
);

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { story, pages, path } = await request.json();

  // Log the script and opts to verify their values
  console.log("Script:", script);
  console.log("GPTScript Path:", gptScriptPath);

  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --pages ${pages} --path ${path}`,
  };

  // Log the opts to verify their values
  console.log("Options:", opts);

  try {
    if (!fs.existsSync(gptScriptPath)) {
      throw new Error(`gptscript binary not found at ${gptScriptPath}`);
    }

    console.log("gptscript binary exists");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Starting gptscript run");
          const run = await g.run(script, opts);

          run.on(RunEventType.Event, (data) => {
            controller.enqueue(
              encoder.encode(`event: ${JSON.stringify(data)}\n\n`)
            );
          });

          await run.text();
          controller.close();
          console.log("gptscript run completed");
        } catch (error: any) {
          controller.error(error);
          console.error("Error during run:", error);
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
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
