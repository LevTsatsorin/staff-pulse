import type React from 'react';

import { Button, EmptyState, ErrorState, Skeleton } from 'src/components/common';
import { DashboardLayout, Header, Panel } from 'src/components/layout';
import { OrgTree } from 'src/components/orgTree';
import { useOrgTree } from 'src/hooks/orgTree/useOrgTree';
import { toUserMessage } from 'src/utils/toUserMessage';

export const DashboardPage: React.FC = () => {
  const { data: model, status, error, refetch, isFetching } = useOrgTree();

  const renderTree = () => {
    if (status === 'pending') return <Skeleton />;
    if (status === 'error')
      return <ErrorState message={toUserMessage(error)} onRetry={() => refetch()} />;
    if (model.rootIds.length === 0) {
      return (
        <EmptyState
          title="Структура пуста"
          description="Сервер вернул пустой список подразделений"
          action={
            <Button type="button" $variant="ghost" onClick={() => refetch()}>
              Обновить
            </Button>
          }
        />
      );
    }
    return <OrgTree model={model} />;
  };

  return (
    <DashboardLayout header={<Header isRefreshing={status === 'success' && isFetching} />}>
      <Panel title="Структура">{renderTree()}</Panel>
    </DashboardLayout>
  );
};
