export const theme = {
  colors: {
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    surfaceHover: 'var(--color-surface-hover)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    accent: 'var(--color-accent)',
    accentSoft: 'var(--color-accent-soft)',
    danger: 'var(--color-danger)',
    flash: 'var(--color-flash)',
    skeleton: 'var(--color-skeleton)',
  },
  radius: { sm: '6px', md: '10px' },
  shadow: 'var(--shadow-card)',
  rowHeight: 'var(--row-height)',
  space: (n: number) => `${n * 4}px`,
};

export type AppTheme = typeof theme;
