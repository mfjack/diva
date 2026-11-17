import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const completeFinishedAppointments = cache(async (): Promise<void> => {
  const supabase = await createClient();
  await supabase.rpc("complete_finished_appointments");
});
