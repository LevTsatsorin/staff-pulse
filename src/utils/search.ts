import { LOCALE } from 'src/constants/ui';

type TextSegment = { text: string; isMatch: boolean; start: number };

export const normalizeQuery = (query: string): string => query.trim().toLocaleLowerCase(LOCALE);

// Offsets found in the lowercased copy are applied to the original text:
// lowercasing keeps string length for ru/en names.
export const splitByMatch = (text: string, query: string): TextSegment[] => {
  const needle = normalizeQuery(query);
  if (!needle) return [{ text, isMatch: false, start: 0 }];

  const haystack = text.toLocaleLowerCase(LOCALE);
  const segments: TextSegment[] = [];
  const add = (start: number, end: number, isMatch: boolean) => {
    if (end > start) segments.push({ text: text.slice(start, end), isMatch, start });
  };

  let cursor = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    add(cursor, index, false);
    cursor = index + needle.length;
    add(index, cursor, true);
    index = haystack.indexOf(needle, cursor);
  }
  add(cursor, text.length, false);
  return segments;
};
