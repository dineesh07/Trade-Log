import { z } from "zod";

export const tradeSchema = z.object({
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  tradeTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be 24h format HH:mm"),
  type: z.enum(["SL", "TP"], {
    errorMap: () => ({ message: "Trade type must be either SL or TP" }),
  }),
  value: z.coerce
    .number({ invalid_type_error: "Value must be a number" })
    .int("Value must be an integer")
    .positive("Value must be greater than 0"),
});

export const tradeUpdateSchema = tradeSchema.partial();

export const strategySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Strategy name is required")
    .max(50, "Strategy name must be 50 characters or less"),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
