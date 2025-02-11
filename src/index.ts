import "dotenv/config";

import { CoCo } from "./structures";

export const bot = new CoCo();

bot.run();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Error", error);
  // ... your custom to channel logger
});
