import * as z from "zod";

z.config({
  customError: (issue) => {
    if (issue.path) {
      const fieldName = issue.path.join(".") || "Field";
      if (issue.code === "invalid_type" && !issue.input) {
        return `${fieldName} wajib diisi`;
      }
    }
    return null;
  },
});

const registerSchema = z.object({
  username: z
    .string()
    .min(5, "Username must be at least 5 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export { registerSchema, loginSchema };
