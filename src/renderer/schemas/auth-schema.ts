import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters long" })
  .regex(/[a-z]/, { error: "Password must include a lowercase letter" })
  .regex(/[A-Z]/, { error: "Password must include an uppercase letter" })
  .regex(/\d/, { error: "Password must include a number" })
  .regex(/[^A-Za-z0-9\s]/, { error: "Password must include a symbol" });

export const OnboardingForm = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export const LoginForm = z.object({
  password: z.string().min(1, { message: "Password is required" }),
});
