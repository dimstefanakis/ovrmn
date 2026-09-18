export const EXPLORE_FIRST_TEXT = "Hey OVRMN, what can you do for me?";

/** Opens a draft only. Pilot contacts must already be invited in Linq. */
export function firstTextSmsUrl(number: string | null, message: string) {
  if (!number || !/^\+[1-9]\d{7,14}$/.test(number) || !message.trim()) return null;
  return `sms:${number}&body=${encodeURIComponent(message)}`;
}
