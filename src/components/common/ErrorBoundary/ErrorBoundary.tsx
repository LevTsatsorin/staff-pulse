import React from 'react';

import { ErrorState } from 'src/components/common/ErrorState/ErrorState';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const reload = () => window.location.reload();

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorState message="Ошибка отображения. Перезагрузите страницу." onRetry={reload} />;
    }
    return this.props.children;
  }
}
