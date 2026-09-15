export const LOCALE = 'ru-RU';

// nodes with depth <= this value start expanded (0 = only roots)
export const DEFAULT_EXPANDED_DEPTH = 0;

export const PERFORMANCE_THRESHOLDS = { mid: 50, high: 80 } as const;

// Level naming by depth (assignment: division → department → team); deeper levels fall back.
export const LEVEL_LABELS = [
  { name: 'Дивизион', ownPrefix: 'В самом дивизионе' },
  { name: 'Отдел', ownPrefix: 'В самом отделе' },
  { name: 'Команда', ownPrefix: 'В самой команде' },
] as const;
export const FALLBACK_LEVEL_LABEL = { name: 'Подразделение', ownPrefix: 'В самом подразделении' };
