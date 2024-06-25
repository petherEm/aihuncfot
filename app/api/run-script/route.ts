import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";
import { join } from "path";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const script = "app/api/run-script/story-book.gpt";

console.log("Script:", script);
// Determine the path to the gptscript binary dynamically
const gptScriptPath = join(
  process.cwd(),
  "node_modules",
  "@gptscript-ai",
  "gptscript",
  "bin",
  "gptscript"
);

export const maxDuration = 60; // Increase to help diagnose

export async function POST(request: NextRequest) {
  console.log("POST request received");

  try {
    const { story, pages, path } = await request.json();
    console.log("Request body parsed:", { story, pages, path });

    console.log("Script:", script);
    console.log("GPTScript Path:", gptScriptPath);

    // Check if the binary exists
    if (!fs.existsSync(gptScriptPath)) {
      console.error(`gptscript binary not found at ${gptScriptPath}`);
      return new Response(
        JSON.stringify({
          error: `gptscript binary not found at ${gptScriptPath}`,
        }),
        {
          status: 500,
        }
      );
    }

    console.log("gptscript binary exists");

    const opts: RunOpts = {
      disableCache: true,
      input: `--story ${story} --pages ${pages} --path ${path}`,
    };

    console.log("Options prepared:", opts);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Starting gptscript run");
          const run = await g.run(script, opts);

          run.on(RunEventType.Event, (data) => {
            console.log("Event received:", data);
            controller.enqueue(
              encoder.encode(`event: ${JSON.stringify(data)}\n\n`)
            );
          });

          await run.text();
          controller.close();
          console.log("gptscript run completed");
        } catch (error: any) {
          console.error("Error during run:", error);
          controller.error(error);
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
