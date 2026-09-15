import type React from 'react';

import styled from 'styled-components';

import { OrgTreeNode } from 'src/components/orgTree/OrgTreeNode/OrgTreeNode';
import { useRovingTree } from 'src/hooks/orgTree';
import type { OrgModel } from 'src/types/orgModel';

interface OrgTreeProps {
  model: OrgModel;
}

export const OrgTree: React.FC<OrgTreeProps> = ({ model }) => {
  const { activeId, setActiveId, containerRef, handleKeyDown } = useRovingTree(model);

  return (
    <Tree role="tree" aria-label="Орг-структура" ref={containerRef} onKeyDown={handleKeyDown}>
      {model.rootIds.map(id => (
        <OrgTreeNode key={id} id={id} model={model} activeId={activeId} onFocusNode={setActiveId} />
      ))}
    </Tree>
  );
};

const Tree = styled.ul`
  padding: ${({ theme }) => theme.space(1)};

  ul[role='group'] {
    --indent-line: var(--color-indent-1);
    --indent-band: var(--color-indent-1-band);
  }

  ul[role='group'] ul[role='group'] {
    --indent-line: var(--color-indent-2);
    --indent-band: var(--color-indent-2-band);
  }

  ul[role='group'] ul[role='group'] ul[role='group'] {
    --indent-line: var(--color-indent-3);
    --indent-band: var(--color-indent-3-band);
  }

  ul[role='group'] ul[role='group'] ul[role='group'] ul[role='group'] {
    --indent-line: var(--color-indent-4);
    --indent-band: var(--color-indent-4-band);
  }
`;
