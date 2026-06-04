import { z } from "zod";
import {
  optionalPreprocessor,
  patchPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";

export class AlbumValidation {
  // Create album schema
  static createAlbumSchema = z.object({
    body: z
      .object({
        title: z.preprocess(
          requiredPreprocessor,
          z.string({ message: "Title is required" }).min(1).max(255),
        ),
        artistId: z.preprocess(
          optionalPreprocessor,
          z.string().uuid({ message: "Invalid artist ID" }).optional(),
        ),
        releaseDate: z.preprocess(
          optionalPreprocessor,
          z.string().optional().nullable(),
        ),
      })
      .transform(({ title, artistId, releaseDate }) => ({
        title,
        artist_id: artistId,
        release_date: releaseDate,
      })),
  });

  // Update album schema
  static updateAlbumSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid album ID" }),
    }),
    body: z
      .object({
        title: z.preprocess(
          patchPreprocessor,
          z.string().min(1).max(255).optional(),
        ),
        releaseDate: z.preprocess(
          patchPreprocessor,
          z.string().optional().nullable(),
        ),
      })
      .transform(({ title, releaseDate }) => ({
        title,
        release_date: releaseDate,
      })),
  });

  // Delete album schema
  static deleteAlbumSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid album ID" }),
    }),
  });
}

export type ICreateAlbumInput = z.infer<
  typeof AlbumValidation.createAlbumSchema.shape.body
>;
export type IUpdateAlbumInput = z.infer<
  typeof AlbumValidation.updateAlbumSchema.shape.body
>;
