import { InvitationRequestStatus, UserRole } from "src/enums";
import {
  emailPreprocessor,
  optionalPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";
import { z } from "zod";

export class InvitationRequestValidation {
  static createSchema = z.object({
    body: z
      .object({
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
            .optional(),
        ),
        email: z.preprocess(
          emailPreprocessor,
          z
            .string({ message: "Email is required" })
            .email({ message: "Invalid email format" })
            .max(255, { message: "Email must not exceed 255 characters" }),
        ),
        role: z.enum([UserRole.ARTIST_MANAGER, UserRole.ARTIST]),
      })
      .transform(({ firstName, lastName, email, role }) => ({
        first_name: firstName,
        last_name: lastName ?? null,
        email,
        role,
      })),
  });

  static respondSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid request ID" }),
    }),
  });

  static updateStatusSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid request ID" }),
    }),
    body: z.object({
      status: z.enum([
        InvitationRequestStatus.PENDING,
        InvitationRequestStatus.REJECTED,
      ]),
    }),
  });

  static deleteSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid request ID" }),
    }),
  });
}

export type ICreateInvitationRequestInput = z.infer<
  typeof InvitationRequestValidation.createSchema.shape.body
>;
