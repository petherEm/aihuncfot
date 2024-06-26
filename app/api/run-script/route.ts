import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const script =
  process.env.GPT_SCRIPT_PATH ||
  path.join(__dirname, "app/api/run-script/story-book.gpt");

export const maxDuration = 60;

export async function POST(request: {
  json: () =>
    | PromiseLike<{ story: any; pages: any; path: any }>
    | { story: any; pages: any; path: any };
}) {
  console.log("POST request received");

  const { story, pages, path: outputPath } = await request.json();

  // Log the script path
  console.log("Resolved script path:", script);

  // Check if the file exists
  if (!fs.existsSync(script)) {
    console.error("Script file not found:", script);
    return new Response(JSON.stringify({ error: "Script file not found" }), {
      status: 500,
    });
  }

  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --pages ${pages} --path ${outputPath}`,
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
        } catch (error) {
          controller.error(error);
          console.error("Error during script execution:", error);
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
    console.error("General error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
