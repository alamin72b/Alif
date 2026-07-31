import { z } from "zod";

export const taskCommandSchema = z.object({
  command: z.string().min(1),
});

export type TaskCommand = z.infer<typeof taskCommandSchema>;
