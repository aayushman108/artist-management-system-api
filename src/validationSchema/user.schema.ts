import { DeleteType, Gender, UserRole } from "src/enums";
import {
  emailPreprocessor,
  optionalPreprocessor,
  patchPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";
import { z } from "zod";

export class UserValidation {
  // Invite user schema
  static inviteUserSchema = z.object({
    body: z.object({
      firstName: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "First name is required" })
          .min(1, { message: "First name is required" })
          .max(100, { message: "First name must not exceed 100 characters" }),
      ),
      lastName: z.preprocess(
        optionalPreprocessor,
        z
          .string()
          .max(100, { message: "Last name must not exceed 100 characters" })
          .optional()
          .nullable(),
      ),
      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" })
          .max(255, { message: "Email must not exceed 255 characters" }),
      ),
      role: z.enum([
        UserRole.SUPER_ADMIN,
        UserRole.ARTIST_MANAGER,
        UserRole.ARTIST,
      ]),
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

  // Update profile schema (params.id optional for /profile/me)
  static updateProfileSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid user ID" }).optional(),
    }),
    body: z
      .object({
        phone: z.preprocess(
          patchPreprocessor,
          z
            .string()
            .regex(/^9\d{9}$/, "Enter a valid 10-digit number starting with 9")
            .optional()
            .nullable(),
        ),
        dob: z.preprocess(patchPreprocessor, z.string().optional().nullable()),
        gender: z.preprocess(
          patchPreprocessor,
          z
            .nativeEnum(Gender, { message: "Invalid gender" })
            .optional()
            .nullable(),
        ),
        address: z.preprocess(
          patchPreprocessor,
          z.string().optional().nullable(),
        ),
        firstName: z.preprocess(
          patchPreprocessor,
          z
            .string()
            .min(1, { message: "First name is required" })
            .max(100, { message: "First name must not exceed 100 characters" })
            .optional(),
        ),
        lastName: z.preprocess(
          patchPreprocessor,
          z
            .string()
            .max(100, { message: "Last name must not exceed 100 characters" })
            .optional()
            .nullable(),
        ),
      })
      .transform(({ phone, dob, gender, address, firstName, lastName }) => ({
        phone,
        dob,
        gender,
        address,
        first_name: firstName,
        last_name: lastName,
      })),
  });

  // Delete user schema
  static deleteUserSchema = z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({
      type: z.enum([DeleteType.HARD, DeleteType.SOFT]).optional(),
    }),
  });
}

export type IInviteUserInput = z.infer<
  typeof UserValidation.inviteUserSchema.shape.body
>;

export type IUpdateProfileInput = z.infer<
  typeof UserValidation.updateProfileSchema.shape.body
>;
