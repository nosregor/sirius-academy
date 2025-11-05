
export const VALIDATION_RULES = {
  // Name validation
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  NAME_REGEX: /^[A-Za-z\s'-]+$/,

  // Password validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  PASSWORD_STRENGTH_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,

  // Instrument validation
  INSTRUMENT_MIN_LENGTH: 2,
  INSTRUMENT_MAX_LENGTH: 100,

  // Experience validation (for teachers)
  EXPERIENCE_MIN_YEARS: 0,
  EXPERIENCE_MAX_YEARS: 80,
} as const;

export const VALIDATION_MESSAGES = {
  // Name messages
  FIRST_NAME_REQUIRED: 'First name is required',
  LAST_NAME_REQUIRED: 'Last name is required',
  NAME_FORMAT:
    'Name must contain only letters, spaces, apostrophes, or hyphens',
  NAME_LENGTH: (min: number, max: number) =>
    `Name must be between ${min} and ${max} characters`,

  // Password messages
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_LENGTH: (min: number, max: number) =>
    `Password must be between ${min} and ${max} characters`,
  PASSWORD_STRENGTH:
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',

  // Instrument messages
  INSTRUMENT_REQUIRED: 'Instrument is required',
  INSTRUMENT_LENGTH: (min: number, max: number) =>
    `Instrument must be between ${min} and ${max} characters`,

  // Experience messages
  EXPERIENCE_RANGE: (min: number, max: number) =>
    `Experience must be between ${min} and ${max} years`,
} as const;
