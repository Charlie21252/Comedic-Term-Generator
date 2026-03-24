/**
 * Input validation and sanitization for the generate-term endpoint.
 *
 * Follows OWASP Input Validation best practices:
 *   1. Allowlist approach — only known fields are accepted; extras are rejected
 *   2. Type checking — all fields checked before use
 *   3. Length limits — prevents resource exhaustion and prompt injection abuse
 *   4. Control-character stripping — removes null bytes and non-printable chars
 *      that could be used for log injection or prompt injection
 *   5. Structured return — callers get a typed result, never raw exceptions
 *
 * Reference: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/** Minimum length for the situation field (too short = useless to the AI) */
export const SITUATION_MIN_LENGTH = 5;

/** Maximum length for the situation field.
 *  Keeps prompts within a sensible token budget and prevents abuse. */
export const SITUATION_MAX_LENGTH = 500;

/** Only these fields are accepted in the request body (allowlist) */
const ALLOWED_FIELDS = new Set(["situation"]);

// ─── Types ───────────────────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true; situation: string }
  | { valid: false; error: string; status: 400 };

// ─── Validator ───────────────────────────────────────────────────────────────

/**
 * Validate and sanitize a parsed request body for the generate-term endpoint.
 *
 * Returns `{ valid: true, situation }` on success, or
 * `{ valid: false, error, status }` on any validation failure.
 *
 * The returned `situation` is trimmed, control-character-stripped, and
 * safe to use directly as an AI prompt argument.
 */
export function validateBody(body: unknown): ValidationResult {
  // ── 1. Must be a plain object ─────────────────────────────────────────────
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return {
      valid: false,
      error: "Request body must be a JSON object.",
      status: 400,
    };
  }

  const obj = body as Record<string, unknown>;

  // ── 2. Reject unexpected / unknown fields (allowlist) ────────────────────
  //    Attackers sometimes probe APIs by injecting extra fields to override
  //    server-side logic or cause unexpected behavior downstream.
  const extraFields = Object.keys(obj).filter((k) => !ALLOWED_FIELDS.has(k));
  if (extraFields.length > 0) {
    return {
      valid: false,
      error: `Unexpected field(s) in request: ${extraFields.join(", ")}.`,
      status: 400,
    };
  }

  // ── 3. Required field presence check ─────────────────────────────────────
  if (!("situation" in obj)) {
    return {
      valid: false,
      error: "Missing required field: situation.",
      status: 400,
    };
  }

  // ── 4. Type check ─────────────────────────────────────────────────────────
  if (typeof obj.situation !== "string") {
    return {
      valid: false,
      error: "Field 'situation' must be a string.",
      status: 400,
    };
  }

  // ── 5. Trim whitespace before length checks ───────────────────────────────
  const trimmed = obj.situation.trim();

  // ── 6. Length limits ─────────────────────────────────────────────────────
  if (trimmed.length < SITUATION_MIN_LENGTH) {
    return {
      valid: false,
      error: `Situation must be at least ${SITUATION_MIN_LENGTH} characters.`,
      status: 400,
    };
  }

  if (trimmed.length > SITUATION_MAX_LENGTH) {
    return {
      valid: false,
      error: `Situation must not exceed ${SITUATION_MAX_LENGTH} characters.`,
      status: 400,
    };
  }

  // ── 7. Strip ASCII control characters ────────────────────────────────────
  //    Removes null bytes (U+0000) and non-printable control characters
  //    (U+0001–U+0008, U+000B, U+000C, U+000E–U+001F, U+007F).
  //    Tab (U+0009) and newline (U+000A / U+000D) are preserved as valid input.
  //    This mitigates log injection and prompt injection vectors.
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  if (sanitized.length === 0) {
    return {
      valid: false,
      error: "Situation contains only invalid characters.",
      status: 400,
    };
  }

  return { valid: true, situation: sanitized };
}
