import { LOCALE } from 'src/constants/ui';

const integerFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

export const formatNumber = (value: number): string => integerFormat.format(value);

export const formatMoney = (value: number): string => `${formatNumber(value)} руб.`;
