import { serve } from "inngest/next";
import { inngest } from "@/config/inngest";
import {syncUserCreation, syncUserDeletion, syncUserUpdate } from "@/config/inngest";

// Force Next.js to treat this route as completely dynamic
export const dynamic = "force-dynamic";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion
  ],
});