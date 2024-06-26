// next.config.js
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  webpack: (config, { isServer }) => {
    // Ensure the file is included in the build
    if (isServer) {
      config.externals = [...config.externals, "fs"];
    }

    config.module.rules.push({
      test: /\.gpt$/,
      use: "raw-loader",
    });

    return config;
  },
  env: {
    GPT_SCRIPT_PATH: path.join(__dirname, "app/api/run-script/story-book.gpt"),
  },
};
