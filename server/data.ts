import type { OrgNodeDto } from '../shared/orgTree.ts';

const SEED = 20260914;
const BASE_DATE_MS = Date.UTC(2026, 8, 1);

const STRUCTURE = [
  {
    name: 'Коммерция',
    departments: [
      { name: 'Продажи', teams: ['Enterprise', 'SMB', 'Партнёрский канал'] },
      { name: 'Маркетинг', teams: ['Performance', 'Бренд', 'Контент'] },
      { name: 'Клиентский сервис', teams: ['Поддержка L1', 'Поддержка L2', 'Customer Success'] },
    ],
  },
  {
    name: 'Продукт',
    departments: [
      { name: 'Разработка', teams: ['Web', 'Mobile', 'Platform'] },
      { name: 'Дизайн', teams: ['UX', 'UI-кит', 'Исследования'] },
      { name: 'Аналитика', teams: ['Данные', 'BI', 'Эксперименты'] },
    ],
  },
  {
    name: 'Операции',
    departments: [
      { name: 'Логистика', teams: ['Склад', 'Доставка', 'Планирование'] },
      { name: 'Закупки', teams: ['Поставщики', 'Тендеры', 'Контроль качества'] },
      { name: 'Инфраструктура', teams: ['DevOps', 'Безопасность', 'Helpdesk'] },
    ],
  },
  {
    name: 'Финансы',
    departments: [
      { name: 'Бухгалтерия', teams: ['Расчёты', 'Отчётность', 'Налоги'] },
      { name: 'Казначейство', teams: ['Платежи', 'Кэш-менеджмент', 'Валютный контроль'] },
      { name: 'Контроллинг', teams: ['Бюджетирование', 'Внутренний аудит', 'Риски'] },
    ],
  },
] as const;

// mulberry32: tiny seeded PRNG so every run produces the same 52 nodes
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const createRandomInt = (random: () => number) => (min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));

const generateNodes = (): OrgNodeDto[] => {
  const randomInt = createRandomInt(createRandom(SEED));
  const nodes: OrgNodeDto[] = [];

  const push = (id: string, name: string, parentId: string | null, headcount: number) => {
    nodes.push({
      id,
      name,
      parentId,
      headcount,
      budget: headcount * randomInt(900, 1600) * 1000,
      performance: randomInt(40, 98),
      updatedAt: new Date(BASE_DATE_MS + nodes.length * 60_000).toISOString(),
    });
  };

  for (const [d, division] of STRUCTURE.entries()) {
    const divisionId = `div-${d + 1}`;
    push(divisionId, division.name, null, randomInt(3, 8));

    for (const [p, department] of division.departments.entries()) {
      const departmentId = `${divisionId}-dep-${p + 1}`;
      push(departmentId, department.name, divisionId, randomInt(2, 6));

      for (const [t, team] of department.teams.entries()) {
        push(`${departmentId}-team-${t + 1}`, team, departmentId, randomInt(4, 15));
      }
    }
  }

  return nodes;
};

export const state = {
  version: 1,
  nodes: generateNodes(),
};
