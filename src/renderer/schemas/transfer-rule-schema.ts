import * as z from "zod";

export const TransferRuleFormSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, { message: "Transfer description is required" }),
});
