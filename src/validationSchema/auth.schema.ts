import { UserRole } from "src/enums";
import {
  emailPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";
import { z } from "zod";

export class AuthValidation {
  // Signup schema
  static signupSchema = z.object({
    body: z.object({
      companyName: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Company name is required" })
          .min(1, { message: "Company name is required" })
          .max(255, { message: "Company name must not exceed 255 characters" }),
      ),
      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" })
          .max(255, { message: "Email must not exceed 255 characters" }),
      ),
      password: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Password is required" })
          .min(8, { message: "Password must be at least 8 characters" })
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            {
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
            },
          ),
      ),
      role: z.enum([UserRole.SUPER_ADMIN]),
    }),
  });
  // Login schema
  static loginSchema = z.object({
    body: z.object({
      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" }),
      ),
      password: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Password is required" })
          .min(8, { message: "Password must be at least 8 characters" })
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            {
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
            },
          ),
      ),
    }),
  });
}

export type ISignupInput = z.infer<
  typeof AuthValidation.signupSchema.shape.body
>;
export type ILoginInput = z.infer<typeof AuthValidation.loginSchema.shape.body>;
