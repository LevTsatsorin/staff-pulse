import { use } from 'react';

import { SelectionContext } from 'src/providers/SelectionProvider';

export const useSelection = () => use(SelectionContext);
