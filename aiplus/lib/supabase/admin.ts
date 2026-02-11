import { createClient } from "@supabase/supabase-js";

let cachedAdmin: ReturnType<typeof createClient> | null = null;

const getAdminClient = () => {
  if (cachedAdmin) {
    return cachedAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required");
  }

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  cachedAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });

  return cachedAdmin;
};

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getAdminClient();
    const value = (client as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
