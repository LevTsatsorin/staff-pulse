import type React from 'react';

import styled from 'styled-components';

import { splitByMatch } from 'src/utils/search';

interface HighlightedTextProps {
  text: string;
  query: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => (
  <>
    {splitByMatch(text, query).map(segment =>
      segment.isMatch ? <Mark key={segment.start}>{segment.text}</Mark> : segment.text,
    )}
  </>
);

const Mark = styled.mark`
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.flash};
  color: inherit;
`;
