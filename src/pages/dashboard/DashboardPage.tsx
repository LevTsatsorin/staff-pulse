import type React from 'react';
import { useMemo, useState } from 'react';

import { Button, EmptyState, ErrorState } from 'src/components/common';
import {
  DashboardLayout,
  Header,
  Panel,
  type RefreshState,
  SplitView,
  ViewToggle,
} from 'src/components/layout';
import { OrgTable, OrgTableSkeleton } from 'src/components/orgTable';
import { OrgTree, OrgTreeSkeleton } from 'src/components/orgTree';
import { useOrgLiveUpdates } from 'src/hooks/live';
import { useOrgTree } from 'src/hooks/orgTree';
import { SelectionProvider } from 'src/providers/SelectionProvider';
import { ViewMode } from 'src/types/view';
import { toUserMessage } from 'src/utils/toUserMessage';
import { getDefaultExpandedIds } from 'src/utils/tree/getDefaultExpandedIds';

const TREE_TITLE = 'Структура';
const TABLE_TITLE = 'Аналитика';

const getRefreshState = (hasData: boolean, isFetching: boolean, isError: boolean): RefreshState => {
  if (!hasData) return 'idle';
  if (isFetching) return 'refreshing';
  return isError ? 'failed' : 'idle';
};

export const DashboardPage: React.FC = () => {
  const { data: model, status, error, refetch, isFetching } = useOrgTree();
  const connection = useOrgLiveUpdates();
  const [view, setView] = useState<ViewMode>(ViewMode.Tree);
  const defaultExpandedIds = useMemo(() => model && getDefaultExpandedIds(model), [model]);
  const retry = () => refetch();

  // A failed background refetch keeps the last data on screen; the header reports it.
  const renderContent = () => {
    if (!model && status === 'pending') {
      return (
        <SplitView
          view={view}
          tree={
            <Panel title={TREE_TITLE}>
              <OrgTreeSkeleton />
            </Panel>
          }
          table={
            <Panel title={TABLE_TITLE}>
              <OrgTableSkeleton />
            </Panel>
          }
        />
      );
    }
    if (!model) {
      return (
        <Panel title={TREE_TITLE}>
          <ErrorState message={toUserMessage(error)} onRetry={retry} isRetrying={isFetching} />
        </Panel>
      );
    }
    if (model.rootIds.length === 0) {
      return (
        <Panel title={TREE_TITLE}>
          <EmptyState
            title="Структура пуста"
            description="Сервер вернул пустой список подразделений"
            action={
              <Button type="button" $variant="ghost" onClick={retry}>
                Обновить
              </Button>
            }
          />
        </Panel>
      );
    }
    return (
      <SelectionProvider defaultExpandedIds={defaultExpandedIds}>
        <SplitView
          view={view}
          tree={
            <Panel title={TREE_TITLE}>
              <OrgTree model={model} />
            </Panel>
          }
          table={
            <Panel title={TABLE_TITLE}>
              <OrgTable model={model} />
            </Panel>
          }
        />
      </SelectionProvider>
    );
  };

  const hasViews = model ? model.rootIds.length > 0 : status === 'pending';

  return (
    <DashboardLayout
      header={
        <Header
          refreshState={getRefreshState(Boolean(model), isFetching, status === 'error')}
          connection={connection}
          actions={hasViews && <ViewToggle value={view} onChange={setView} />}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
};
