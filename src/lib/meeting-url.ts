import { z } from "zod";

export const optionalMeetingUrlSchema = z.union([
  z.literal(""),
  z
    .url({
      protocol: /^https$/,
      error: "Cole o link completo, começando com https://.",
    })
    .max(500, "Link muito longo."),
]);
