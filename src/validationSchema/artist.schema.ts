import { z } from "zod";
import { DeleteType, Gender } from "src/enums";
import {
  emailPreprocessor,
  optionalPreprocessor,
  patchPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";

export class ArtistValidation {
  static updateArtistSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid artist ID" }),
    }),
    body: z
      .object({
        stageName: z.preprocess(
          patchPreprocessor,
          z.string().min(1).max(255).optional(),
        ),
        dob: z.preprocess(patchPreprocessor, z.string().optional().nullable()),
        gender: z.preprocess(
          patchPreprocessor,
          z.nativeEnum(Gender).optional().nullable(),
        ),
        address: z.preprocess(
          patchPreprocessor,
          z.string().optional().nullable(),
        ),
        firstReleaseYear: z.preprocess(
          patchPreprocessor,
          z.coerce.number().int().optional().nullable(),
        ),
        managerId: z.preprocess(
          patchPreprocessor,
          z.string().uuid().optional().nullable(),
        ),
      })
      .transform(
        ({ stageName, dob, gender, address, firstReleaseYear, managerId }) => ({
          stage_name: stageName,
          dob,
          gender,
          address,
          first_release_year: firstReleaseYear,
          manager_id: managerId,
        }),
      ),
  });

  static deleteArtistSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid artist ID" }),
    }),
    body: z.object({
      type: z.enum([DeleteType.HARD, DeleteType.SOFT]).optional(),
    }),
  });

  static updateArtistProfileSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid user ID" }).optional(),
    }),
    body: z
      .object({
        stageName: z.preprocess(
          patchPreprocessor,
          z.string().min(1).max(255).optional(),
        ),
        dob: z.preprocess(patchPreprocessor, z.string().optional().nullable()),
        gender: z.preprocess(
          patchPreprocessor,
          z.nativeEnum(Gender).optional().nullable(),
        ),
        address: z.preprocess(
          patchPreprocessor,
          z.string().optional().nullable(),
        ),
        firstReleaseYear: z.preprocess(
          patchPreprocessor,
          z.coerce.number().int().optional().nullable(),
        ),
        managerId: z.preprocess(
          patchPreprocessor,
          z.string().uuid().optional().nullable(),
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
      .transform(
        ({
          stageName,
          dob,
          gender,
          address,
          firstReleaseYear,
          managerId,
          firstName,
          lastName,
        }) => ({
          stage_name: stageName,
          dob,
          gender,
          address,
          first_release_year: firstReleaseYear,
          manager_id: managerId,
          first_name: firstName,
          last_name: lastName,
        }),
      ),
  });

  static artistCsvRowSchema = z.object({
    email: z.preprocess(
      emailPreprocessor,
      z
        .string({ message: "Email is required" })
        .email({ message: "Invalid email format" })
        .max(255, { message: "Email must not exceed 255 characters" }),
    ),
    first_name: z.preprocess(
      requiredPreprocessor,
      z
        .string({ message: "First name is required" })
        .min(1, { message: "First name is required" })
        .max(100, { message: "First name must not exceed 100 characters" }),
    ),
    last_name: z.preprocess(
      optionalPreprocessor,
      z
        .string()
        .max(100, { message: "Last name must not exceed 100 characters" })
        .optional()
        .nullable(),
    ),
    stage_name: z.preprocess(
      requiredPreprocessor,
      z
        .string({ message: "Stage name is required" })
        .min(1, { message: "Stage name is required" })
        .max(255, { message: "Stage name must not exceed 255 characters" }),
    ),
    dob: z.preprocess(optionalPreprocessor, z.string().optional().nullable()),
    gender: z.preprocess(
      optionalPreprocessor,
      z.nativeEnum(Gender).optional().nullable(),
    ),
    address: z.preprocess(
      optionalPreprocessor,
      z.string().optional().nullable(),
    ),
    first_release_year: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    }, z.number().int().min(1900).max(2100).nullable().optional()),
  });
}

export type IUpdateArtistInput = z.infer<
  typeof ArtistValidation.updateArtistSchema.shape.body
>;

export type IArtistCsvRow = z.infer<typeof ArtistValidation.artistCsvRowSchema>;

export type IUpdateArtistProfileInput = z.infer<
  typeof ArtistValidation.updateArtistProfileSchema.shape.body
>;
