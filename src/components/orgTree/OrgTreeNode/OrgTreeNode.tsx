import type React from 'react';
import { useRef } from 'react';

import styled from 'styled-components';

import { Collapsible, FlashValue, PerformanceIndicator } from 'src/components/common';
import { EXPAND_ANIMATION_MS, FALLBACK_LEVEL_LABEL, LEVEL_LABELS } from 'src/constants/ui';
import { useScrollIntoView, useSelection } from 'src/hooks/common';
import { focusRing, tabularNums } from 'src/styles/mixins';
import type { OrgModel } from 'src/types/orgModel';

interface OrgTreeNodeProps {
  id: string;
  model: OrgModel;
  activeId: string | null;
  onFocusNode: (id: string) => void;
}

export const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({ id, model, activeId, onFocusNode }) => {
  const { selectedId, expandedIds, select, toggleExpanded } = useSelection();
  const rowRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedId === id;
  const isActive = activeId === id;
  useScrollIntoView(rowRef, isSelected, EXPAND_ANIMATION_MS);

  const node = model.nodes[id];
  const aggregate = model.aggregates[id];
  if (!node || !aggregate) return null;

  const childIds = model.childrenIds[id] ?? [];
  const hasChildren = childIds.length > 0;
  const isExpanded = hasChildren && expandedIds.has(id);

  // Focus events bubble through nested items; without stopping here the ancestor item would
  // register itself as active right after the child did.
  const handleFocus = (event: React.FocusEvent) => {
    event.stopPropagation();
    onFocusNode(id);
  };

  // Safari and Firefox on macOS do not focus a clicked button, so a click would leave the keyboard
  // target outside the tree. Focusing the item itself keeps arrow keys working in every browser.
  const handleMouseDown = (event: React.MouseEvent<HTMLLIElement>) => {
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.focus();
  };

  const level = LEVEL_LABELS[node.depth] ?? FALLBACK_LEVEL_LABEL;
  const ownDetails = hasChildren
    ? `${level.ownPrefix}: ${node.headcount} чел., эффективность ${Math.round(node.performance)}%`
    : undefined;

  return (
    <Item
      role="treeitem"
      tabIndex={isActive ? 0 : -1}
      data-tree-id={id}
      aria-level={node.depth + 1}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
    >
      <Row ref={rowRef} $selected={isSelected}>
        {hasChildren ? (
          <Chevron
            type="button"
            tabIndex={-1}
            aria-label={isExpanded ? 'Свернуть' : 'Раскрыть'}
            $expanded={isExpanded}
            onClick={() => toggleExpanded(id)}
          />
        ) : (
          <ChevronPlaceholder aria-hidden="true" />
        )}
        <SelectButton type="button" tabIndex={-1} onClick={() => select(id)}>
          <Name $isRoot={node.depth === 0}>{node.name}</Name>
          <Meta data-tip={ownDetails}>
            <FlashValue value={aggregate.totalHeadcount}>
              <Headcount $hasDetails={Boolean(ownDetails)}>
                {aggregate.totalHeadcount} чел.
              </Headcount>
            </FlashValue>
            <FlashValue value={aggregate.avgPerformance}>
              <PerformanceIndicator value={aggregate.avgPerformance} />
            </FlashValue>
          </Meta>
        </SelectButton>
      </Row>
      {hasChildren && (
        <Collapsible isOpen={isExpanded}>
          <Group role="group">
            {childIds.map(childId => (
              <OrgTreeNode
                key={childId}
                id={childId}
                model={model}
                activeId={activeId}
                onFocusNode={onFocusNode}
              />
            ))}
          </Group>
        </Collapsible>
      )}
    </Item>
  );
};

// The item itself is the keyboard target; its inner buttons stay clickable but leave the tab order.
const Item = styled.li`
  outline: none;

  &:focus-visible > div {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.accent};
  }
`;

const Row = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1)};
  min-height: ${({ theme }) => theme.rowHeight};
  padding: 0 ${({ theme }) => theme.space(2)};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.accentSoft : 'transparent')};
  scroll-margin-block: ${({ theme }) => theme.space(2)};
  transition: background 120ms ease;

  &:hover {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.accentSoft : theme.colors.surfaceHover)};
  }
`;

const SelectButton = styled.button`
  display: flex;
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  min-width: 0;
  min-height: ${({ theme }) => theme.rowHeight};
  padding: 0 ${({ theme }) => theme.space(1)};
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  text-align: left;
  cursor: pointer;
  ${focusRing}
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

const Name = styled.span<{ $isRoot: boolean }>`
  flex: 1;
  font-weight: ${({ $isRoot }) => ($isRoot ? 600 : 400)};
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

const Headcount = styled.span<{ $hasDetails: boolean }>`
  flex: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  text-decoration: ${({ $hasDetails }) => ($hasDetails ? 'underline dotted' : 'none')};
  text-underline-offset: 3px;
  cursor: ${({ $hasDetails }) => ($hasDetails ? 'help' : 'inherit')};
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
