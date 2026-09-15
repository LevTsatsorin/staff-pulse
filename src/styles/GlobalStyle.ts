import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #f4f5f8;
    --color-surface: #ffffff;
    --color-surface-hover: #f7f8fb;
    --color-border: #e3e6ec;
    --color-text: #1b1f27;
    --color-text-muted: #6b7280;
    --color-accent: #2f6fed;
    --color-accent-soft: #e8f0ff;
    --color-danger: #d92d20;
    --color-flash: #fff1b8;
    --color-skeleton: #e9ebf0;
    --color-tone-low-bg: #fde8e8;
    --color-tone-low-text: #b42318;
    --color-tone-mid-bg: #fff4e5;
    --color-tone-mid-text: #b54708;
    --color-tone-high-bg: #e6f7ee;
    --color-tone-high-text: #027a48;
    --color-indent-1: hsl(215 85% 58% / 55%);
    --color-indent-1-band: hsl(215 85% 58% / 7%);
    --color-indent-2: hsl(280 70% 60% / 55%);
    --color-indent-2-band: hsl(280 70% 60% / 7%);
    --color-indent-3: hsl(165 70% 42% / 55%);
    --color-indent-3-band: hsl(165 70% 42% / 8%);
    --color-indent-4: hsl(35 90% 52% / 60%);
    --color-indent-4-band: hsl(35 90% 52% / 8%);
    --shadow-card: 0 1px 2px rgb(16 24 40 / 6%), 0 1px 3px rgb(16 24 40 / 10%);
    --row-height: 36px;
    color-scheme: light dark;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg: #0f1117;
      --color-surface: #171a22;
      --color-surface-hover: #1e222c;
      --color-border: #2a2f3a;
      --color-text: #e6e8ee;
      --color-text-muted: #9aa1ae;
      --color-accent: #6b9cff;
      --color-accent-soft: #1d2a47;
      --color-danger: #f97066;
      --color-flash: #4d4118;
      --color-skeleton: #262a34;
      --color-tone-low-bg: #3b1a1a;
      --color-tone-low-text: #f97066;
      --color-tone-mid-bg: #3d2a12;
      --color-tone-mid-text: #fdb022;
      --color-tone-high-bg: #12301f;
      --color-tone-high-text: #4ade80;
      --color-indent-1: hsl(215 85% 65% / 60%);
      --color-indent-1-band: hsl(215 85% 65% / 10%);
      --color-indent-2: hsl(280 70% 70% / 60%);
      --color-indent-2-band: hsl(280 70% 70% / 10%);
      --color-indent-3: hsl(165 70% 55% / 60%);
      --color-indent-3-band: hsl(165 70% 55% / 10%);
      --color-indent-4: hsl(35 90% 60% / 65%);
      --color-indent-4-band: hsl(35 90% 60% / 10%);
      --shadow-card: 0 1px 2px rgb(0 0 0 / 40%);
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  body {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: var(--color-text);
    background: var(--color-bg);
    -webkit-font-smoothing: antialiased;
  }

  button {
    font: inherit;
    color: inherit;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;
