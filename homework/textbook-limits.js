export const MAX_TEXTBOOK_FILE_MB = 100;
export const MAX_TEXTBOOK_FILE_BYTES = MAX_TEXTBOOK_FILE_MB * 1_000_000;
// One-million-character limit for the extracted text sent to cloud storage.
export const MAX_TEXTBOOK_TEXT_LENGTH = 1_000_000;
export const TEXTBOOK_TEXT_LIMIT_MESSAGE = 'Văn bản giáo trình vượt quá 1.000.000 ký tự.';
