import * as z from "zod";

// Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const OnboardingForm = z
  .object({
    password: z.string().regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
    }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export const LoginForm = z.object({
  password: z.string().min(1, { message: "Password is required" }),
});
