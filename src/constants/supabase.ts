import { createClient } from "@supabase/supabase-js";

require("dotenv").config();

export const supabaseClient = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);
