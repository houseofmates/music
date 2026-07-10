// Utility function to truncate text with ellipsis at a specified max length
export function truncateText(text, maxLength = 30) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Utility to format text for multi-line display (20 chars per line, max 2 lines)
export function formatMultiLine(text, charsPerLine = 20, maxLines = 2) {
  if (!text) return '';
  const maxChars = charsPerLine * maxLines;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

