import { UserRole } from "src/enums";
import {
  emailPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";
import { z } from "zod";

export class UserValidation {
  // Invite user schema
  static inviteUserSchema = z.object({
    body: z.object({
      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" })
          .max(255, { message: "Email must not exceed 255 characters" }),
      ),
      role: z.enum([UserRole.ARTIST_MANAGER, UserRole.ARTIST]),
    }),
  });
  // Verify invite schema
  static verifyInviteSchema = z.object({
    body: z.object({
      token: z.string({ message: "Token is required" }),
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

export type IInviteUserInput = z.infer<
  typeof UserValidation.inviteUserSchema.shape.body
>;
