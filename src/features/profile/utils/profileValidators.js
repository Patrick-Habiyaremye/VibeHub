import { MAX_FILE_SIZE_MB } from "../constants/profile.constants";

// Returns { valid: true } or { valid: false, error: string }.
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please choose an image file." };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${MAX_FILE_SIZE_MB}MB.` };
  }
  return { valid: true };
}