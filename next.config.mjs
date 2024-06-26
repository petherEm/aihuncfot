// next.config.js
module.exports = {
  env: {
    GPT_SCRIPT_PATH: path.join(
      process.cwd(),
      "app/api/run-script/story-book.gpt"
    ),
  },
};
