import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { z } from "zod";
import { BadRequestError } from "src/utils/catchError.utli";

interface CsvParseError {
  row: number;
  message: string;
}

function parseCsv<T>(
  content: string,
  schema: z.ZodType<T>,
): { data: T[]; errors: CsvParseError[] } {
  let records: Record<string, string>[];
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    });
  } catch (e: any) {
    throw new BadRequestError(`Invalid CSV format: ${e.message || "Failed to parse CSV"}`);
  }

  const data: T[] = [];
  const errors: CsvParseError[] = [];

  for (let i = 0; i < records.length; i++) {
    const result = schema.safeParse(records[i]);
    if (result.success) {
      data.push(result.data);
    } else {
      errors.push({
        row: i + 2,
        message: result.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; "),
      });
    }
  }

  return { data, errors };
}

function generateCsv<T>(
  data: T[],
  columns: { key: keyof T; header: string }[],
): string {
  return stringify(data, {
    header: true,
    columns: columns.map((c) => ({ key: c.key as string, header: c.header })),
  });
}

export const csvUtil = { parseCsv, generateCsv };

export type { CsvParseError };
