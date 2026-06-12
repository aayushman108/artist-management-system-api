import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { z } from "zod";
import { BadRequestError } from "src/utils/catchError.utli";

interface CsvParseError {
  row: number;
  message: string;
}

const DANGEROUS_PREFIX = /^[=+\-@\t\r]/;

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string" && DANGEROUS_PREFIX.test(value)) {
    return `\t${value}`;
  }
  return value;
}

function sanitizeRecord(
  record: Record<string, string>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const key in record) {
    sanitized[key] = sanitizeValue(record[key]) as string;
  }
  return sanitized;
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
    throw new BadRequestError(
      `Invalid CSV format: ${e.message || "Failed to parse CSV"}`,
    );
  }

  const data: T[] = [];
  const errors: CsvParseError[] = [];

  for (let i = 0; i < records.length; i++) {
    const sanitizedRow = sanitizeRecord(records[i]);
    const result = schema.safeParse(sanitizedRow);
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

function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
): string {
  const sanitized = data.map((row) => {
    const clean: Record<string, unknown> = {};
    for (const key in row) {
      clean[key] = sanitizeValue(row[key]);
    }
    return clean as T;
  });

  return stringify(sanitized, {
    header: true,
    columns: columns.map((c) => ({ key: c.key as string, header: c.header })),
  });
}

export const csvUtil = { parseCsv, generateCsv };

export type { CsvParseError };
