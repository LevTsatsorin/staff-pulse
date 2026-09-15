import type React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';

import { queryClient } from 'src/api/queryClient';
import { ErrorBoundary } from 'src/components/common';
import { DashboardPage } from 'src/pages/dashboard/DashboardPage';
import { GlobalStyle } from 'src/styles/GlobalStyle';
import { theme } from 'src/styles/theme';

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);
