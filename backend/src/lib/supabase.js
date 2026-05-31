import { createClient } from "@supabase/supabase-js";

const nodeVersion = parseInt(process.versions.node.split(".")[0]);
const options = nodeVersion < 22 ? await import("ws").then(m => ({ realtime: { transport: m.default } })) : {};

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  options
);
