import { FALLBACK_LEVEL_LABEL, LEVEL_LABELS, LOCALE } from 'src/constants/ui';
import type { TableRow } from 'src/types/table';
import { formatMoney, formatNumber } from 'src/utils/format/formatNumber';

import type { FilterRange, StructuredFilter } from 'shared/search';

import { filterRows } from './filterRows';

export type FilterCondition = Exclude<keyof StructuredFilter, 'sort'>;
export type FilterChip = { condition: FilterCondition; label: string };

const hasBounds = (range: FilterRange | null): range is FilterRange =>
  range !== null && (range.min !== null || range.max !== null);

const inRange = (value: number | null, range: FilterRange | null): boolean => {
  if (!hasBounds(range)) return true;
  if (value === null) return false;
  return (range.min === null || value >= range.min) && (range.max === null || value <= range.max);
};

const formatRange = (range: FilterRange, format: (value: number) => string): string => {
  if (range.min !== null && range.max !== null) return `${format(range.min)}–${format(range.max)}`;
  return range.min !== null ? `≥ ${format(range.min)}` : `≤ ${format(range.max ?? 0)}`;
};

const formatLevel = (level: number) =>
  (LEVEL_LABELS[level - 1] ?? FALLBACK_LEVEL_LABEL).name.toLocaleLowerCase(LOCALE);

// Ranges are inclusive; a range on an empty average excludes that row.
export const applyStructuredFilter = (
  rows: readonly TableRow[],
  filter: StructuredFilter | null,
): readonly TableRow[] => {
  if (!filter) return rows;

  const { text, levels, headcount, budget, performance } = filter;
  const byText = text ? filterRows(rows, text) : rows;
  const hasLevels = levels !== null && levels.length > 0;
  if (!hasLevels && !hasBounds(headcount) && !hasBounds(budget) && !hasBounds(performance)) {
    return byText;
  }

  return byText.filter(
    row =>
      (!hasLevels || levels.includes(row.depth + 1)) &&
      inRange(row.totalHeadcount, headcount) &&
      inRange(row.totalBudget, budget) &&
      inRange(row.avgPerformance, performance),
  );
};

export const getFilterChips = (filter: StructuredFilter | null): FilterChip[] => {
  if (!filter) return [];
  const chips: FilterChip[] = [];
  if (filter.text) chips.push({ condition: 'text', label: `Название: ${filter.text}` });
  if (filter.levels?.length) {
    chips.push({
      condition: 'levels',
      label: `Уровень: ${filter.levels.map(formatLevel).join(', ')}`,
    });
  }
  if (hasBounds(filter.headcount)) {
    chips.push({
      condition: 'headcount',
      label: `Сотрудники ${formatRange(filter.headcount, formatNumber)}`,
    });
  }
  if (hasBounds(filter.budget)) {
    chips.push({ condition: 'budget', label: `Бюджет ${formatRange(filter.budget, formatMoney)}` });
  }
  if (hasBounds(filter.performance)) {
    chips.push({
      condition: 'performance',
      label: `Эффективность ${formatRange(filter.performance, value => String(Math.round(value)))}`,
    });
  }
  return chips;
};

// Returns null once no condition is left, so an empty filter never lingers.
export const withoutCondition = (
  filter: StructuredFilter,
  condition: FilterCondition,
): StructuredFilter | null => {
  const next = { ...filter, [condition]: null, sort: null };
  return getFilterChips(next).length > 0 ? next : null;
};
