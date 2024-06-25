import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "../../../lib/gptScriptInstance";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execFileAsync = promisify(execFile);

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

export const maxDuration = 60; // Set this as needed

export async function POST(request: NextRequest) {
  const { story, pages, path } = await request.json();

  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --pages ${pages} --path ${path}` ?? "",
  };

  try {
    if (!fs.existsSync(gptScriptPath)) {
      throw new Error(`gptscript binary not found at ${gptScriptPath}`);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const timeoutId = setTimeout(() => {
          controller.error(new Error("Script execution timed out"));
          console.error("Error: Script execution timed out");
        }, maxDuration * 1000);

        try {
          const { stdout, stderr } = await execFileAsync(gptScriptPath, [
            script,
            //@ts-ignore
            ...opts.input.split(" "),
          ]);

          if (stderr) {
            throw new Error(stderr);
          }

          const run = JSON.parse(stdout);

          run.on(RunEventType.Event, (data: any) => {
            controller.enqueue(
              encoder.encode(`event: ${JSON.stringify(data)}\n\n`)
            );
          });

          controller.close();
        } catch (error: any) {
          controller.error(error);
          console.error("Error:", error);
        } finally {
          clearTimeout(timeoutId);
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
