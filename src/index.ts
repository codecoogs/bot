import "dotenv/config";

import { CoCo } from "./structures";
import { keepAlive } from "./server";

export const bot = new CoCo();

keepAlive();

bot.run();
