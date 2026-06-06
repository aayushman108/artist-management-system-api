import { z } from "zod";
import { DeleteType, Gender } from "src/enums";
import { patchPreprocessor } from "src/utils/validationSchemaPreprocessor";

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
      })
      .transform(
        ({ stageName, dob, gender, address, firstReleaseYear }) => ({
          stage_name: stageName,
          dob,
          gender,
          address,
          first_release_year: firstReleaseYear,
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
}

export type IUpdateArtistInput = z.infer<
  typeof ArtistValidation.updateArtistSchema.shape.body
>;
