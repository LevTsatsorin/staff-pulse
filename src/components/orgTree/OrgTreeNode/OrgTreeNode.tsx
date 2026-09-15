import type React from 'react';

import styled from 'styled-components';

import { PerformanceIndicator } from 'src/components/orgTree/PerformanceIndicator/PerformanceIndicator';
import { FALLBACK_LEVEL_LABEL, LEVEL_LABELS } from 'src/constants/ui';
import { focusRing, tabularNums } from 'src/styles/mixins';
import type { OrgModel } from 'src/types/orgModel';

interface OrgTreeNodeProps {
  id: string;
  model: OrgModel;
  expandedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

export const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({ id, model, expandedIds, onToggle }) => {
  const node = model.nodes[id];
  const aggregate = model.aggregates[id];
  if (!node || !aggregate) return null;

  const childIds = model.childrenIds[id] ?? [];
  const hasChildren = childIds.length > 0;
  const isExpanded = hasChildren && expandedIds.has(id);

  const level = LEVEL_LABELS[node.depth] ?? FALLBACK_LEVEL_LABEL;
  const ownDetails = hasChildren
    ? `${level.ownPrefix}: ${node.headcount} чел., эффективность ${node.performance}%`
    : undefined;

  return (
    <Item
      role="treeitem"
      aria-level={node.depth + 1}
      aria-expanded={hasChildren ? isExpanded : undefined}
    >
      <Row>
        {hasChildren ? (
          <Chevron
            type="button"
            aria-label={isExpanded ? 'Свернуть' : 'Раскрыть'}
            $expanded={isExpanded}
            onClick={() => onToggle(id)}
          />
        ) : (
          <ChevronPlaceholder aria-hidden="true" />
        )}
        <Name>{node.name}</Name>
        <Meta data-tip={ownDetails}>
          <Headcount>{aggregate.totalHeadcount} чел.</Headcount>
          <PerformanceIndicator value={aggregate.avgPerformance} />
        </Meta>
      </Row>
      {isExpanded && (
        <Group role="group">
          {childIds.map(childId => (
            <OrgTreeNode
              key={childId}
              id={childId}
              model={model}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </Group>
      )}
    </Item>
  );
};

const Item = styled.li`
  &[aria-level='1'] > div > span:first-of-type {
    font-weight: 600;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  min-height: ${({ theme }) => theme.rowHeight};
  padding: 0 ${({ theme }) => theme.space(2)};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: background 120ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Chevron = styled.button<{ $expanded: boolean }>`
  flex: none;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  ${focusRing}

  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    margin: auto;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(${({ $expanded }) => ($expanded ? '45deg' : '-45deg')});
    transition: transform 150ms ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ChevronPlaceholder = styled.span`
  flex: none;
  width: 24px;
`;

const Name = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Instant CSS tooltip with the node's own values; native title has a delay and is easy to miss.
const Meta = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};

  &[data-tip] > span:first-child {
    text-decoration: underline dotted;
    text-underline-offset: 3px;
    cursor: help;
  }

  &[data-tip]:hover::after {
    content: attr(data-tip);
    position: absolute;
    top: 50%;
    right: calc(100% + ${({ theme }) => theme.space(2)});
    z-index: 1;
    padding: 6px 10px;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
    font-size: 12px;
    white-space: nowrap;
    transform: translateY(-50%);
    box-shadow: ${({ theme }) => theme.shadow};
    pointer-events: none;
  }
`;

const Headcount = styled.span`
  flex: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  ${tabularNums}
`;

// Indent guides: a tinted band under the parent's chevron column plus a line, colored per level
// (see the nesting rules in OrgTree). Pure CSS, no depth prop.
const Group = styled.ul`
  position: relative;
  padding-left: 28px;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 8px;
    width: 24px;
    border-left: 2px solid var(--indent-line);
    border-radius: 3px;
    background: var(--indent-band);
    pointer-events: none;
  }
`;
