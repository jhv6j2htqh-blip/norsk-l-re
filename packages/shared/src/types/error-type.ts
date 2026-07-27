// Types d'erreur utilisateur — voir spec/data-model.md §3 (`user_errors`).
export const ERROR_TYPES = [
  "grammar",
  "vocabulary",
  "spelling",
  "pronunciation",
  "word_order",
] as const;
export type ErrorType = (typeof ERROR_TYPES)[number];
