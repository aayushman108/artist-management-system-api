/**
 * Preprocessor for required fields.
 * Converts null or empty strings to undefined so Zod's message can trigger.
 * Also trims string values.
 */
export const requiredPreprocessor = (val: any) => {
  if (
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "")
  ) {
    return undefined;
  }
  return typeof val === "string" ? val.trim() : val;
};

/**
 * Preprocessor for optional fields.
 * Converts undefined, null, or empty strings to null for database consistency.
 * Also trims string values.
 */
export const optionalPreprocessor = (val: any) => {
  if (
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "")
  ) {
    return null;
  }
  return typeof val === "string" ? val.trim() : val;
};

/**
 * Preprocessor for patch/update fields.
 * Preserves undefined so the field is excluded from updates.
 * Converts null or empty strings to null to clear the field.
 */
export const patchPreprocessor = (val: any) => {
  if (val === undefined) {
    return undefined;
  }
  if (val === null || (typeof val === "string" && val.trim() === "")) {
    return null;
  }
  return typeof val === "string" ? val.trim() : val;
};

/**
 * Trims and converts to lowercase.
 */
export const emailPreprocessor = (val: any) => {
  const processed = requiredPreprocessor(val);
  return typeof processed === "string" ? processed.toLowerCase() : processed;
};

/**
 * Trims and preserves case.
 */
export const textPreprocessor = (val: any) => requiredPreprocessor(val);
