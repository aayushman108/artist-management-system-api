import { z } from "zod";
import {
  optionalPreprocessor,
  patchPreprocessor,
  requiredPreprocessor,
} from "src/utils/validationSchemaPreprocessor";

export class MusicValidation {
  // Create music schema
  static createMusicSchema = z.object({
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
        albumId: z.preprocess(
          optionalPreprocessor,
          z
            .string()
            .uuid({ message: "Invalid album ID" })
            .optional()
            .nullable(),
        ),
        genre: z.preprocess(
          optionalPreprocessor,
          z.string().max(100).optional().nullable(),
        ),
        language: z.preprocess(
          optionalPreprocessor,
          z.string().max(100).optional().nullable(),
        ),
        releaseDate: z.preprocess(
          optionalPreprocessor,
          z.string().optional().nullable(),
        ),
      })
      .transform(
        ({ title, artistId, albumId, genre, language, releaseDate }) => ({
          title,
          artist_id: artistId,
          album_id: albumId,
          genre,
          language,
          release_date: releaseDate,
        }),
      ),
  });

  // Update music schema
  static updateMusicSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid music ID" }),
    }),
    body: z
      .object({
        title: z.preprocess(
          patchPreprocessor,
          z.string().min(1).max(255).optional(),
        ),
        albumId: z.preprocess(
          patchPreprocessor,
          z
            .string()
            .uuid({ message: "Invalid album ID" })
            .optional()
            .nullable(),
        ),
        genre: z.preprocess(
          patchPreprocessor,
          z.string().max(100).optional().nullable(),
        ),
        language: z.preprocess(
          patchPreprocessor,
          z.string().max(100).optional().nullable(),
        ),
        releaseDate: z.preprocess(
          patchPreprocessor,
          z.string().optional().nullable(),
        ),
      })
      .transform(({ title, albumId, genre, language, releaseDate }) => ({
        title,
        album_id: albumId,
        genre,
        language,
        release_date: releaseDate,
      })),
  });

  // Delete music schema
  static deleteMusicSchema = z.object({
    params: z.object({
      id: z.string().uuid({ message: "Invalid music ID" }),
    }),
  });
}

export type ICreateMusicInput = z.infer<
  typeof MusicValidation.createMusicSchema.shape.body
>;
export type IUpdateMusicInput = z.infer<
  typeof MusicValidation.updateMusicSchema.shape.body
>;
