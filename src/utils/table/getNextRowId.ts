const MOVES: Record<string, (index: number, lastIndex: number) => number> = {
  ArrowDown: index => index + 1,
  ArrowUp: index => index - 1,
  Home: () => 0,
  End: (_, lastIndex) => lastIndex,
};

// Returns null for keys that do not move the active row.
export const getNextRowId = (
  rowIds: readonly string[],
  activeId: string | null,
  key: string,
): string | null => {
  const move = MOVES[key];
  if (!move || rowIds.length === 0) return null;

  const lastIndex = rowIds.length - 1;
  const index = activeId === null ? -1 : rowIds.indexOf(activeId);
  return rowIds[Math.min(lastIndex, Math.max(0, move(index, lastIndex)))] ?? null;
};
