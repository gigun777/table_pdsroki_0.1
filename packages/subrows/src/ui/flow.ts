import { addSubrow, getHighlightSubrows } from '../core/ops';
import { isSubrowsEnabled } from '../core/columns';
import { resolveEditTarget } from '../core/selection';
import type { SubrowsUI } from './contracts';
import type { CellActionResult, CellRef, RowId, SubrowsSettings, TableDataset } from '../types';
import type { CellActionResult } from '../types';

export interface UiFlowState {
  shouldOpenChoice: boolean;
  shouldOfferAddSubrow: boolean;
  editTargetRowId: RowId | null;
}

export interface HandleCellClickSubrowsFlowInput {
  ds: TableDataset;
  cellRef: CellRef;
  settings: SubrowsSettings;
  ui: SubrowsUI;
}

export interface SubrowsActionResult {
  dataset: TableDataset;
  addedSubrowId: RowId | null;
  editTargetRowId: RowId | null;
  highlightSubrows: RowId[];
  needsChoice: boolean;
  editTargetRowId: string | null;
}

export function toUiFlowState(result: CellActionResult): UiFlowState {
  switch (result.type) {
    case 'normalEdit':
      return {
        shouldOpenChoice: false,
        shouldOfferAddSubrow: false,
        editTargetRowId: result.targetRowId,
      };
    case 'needsChoice':
      return {
        shouldOpenChoice: true,
        shouldOfferAddSubrow: false,
        editTargetRowId: null,
      };
    case 'canAddSubrow':
      return {
        shouldOpenChoice: false,
        shouldOfferAddSubrow: true,
        editTargetRowId: null,
      };
  }
}

function asResult(dataset: TableDataset, partial?: Partial<SubrowsActionResult>): SubrowsActionResult {
  return {
    dataset,
    addedSubrowId: null,
    editTargetRowId: null,
    highlightSubrows: [],
    needsChoice: false,
    ...partial,
  };
}

export async function handleCellClickSubrowsFlow({
  ds,
  cellRef,
  settings,
  ui,
}: HandleCellClickSubrowsFlowInput): Promise<SubrowsActionResult> {
  const action = resolveEditTarget(ds, cellRef, settings);
  const isSubrowsColumn = isSubrowsEnabled(settings, cellRef.colKey);

  if (!isSubrowsColumn) {
    if (action.type === 'normalEdit') {
      return asResult(ds, { editTargetRowId: action.targetRowId });
    }

    return asResult(ds);
  }

  const choice = await ui.askCellAction({
    title: 'Підстроки',
    message: 'Оберіть дію для клітинки з підстроками',
    canAddSubrow: true,
    canEdit: true,
  });

  if (choice === 'addSubrow') {
    const added = addSubrow(ds, cellRef.rowId, settings);
    ui.toast('Підстроку додано', 'success');
    return asResult(added.dataset, {
      addedSubrowId: added.value,
      editTargetRowId: added.value,
    });
  }

  if (choice !== 'editExisting') {
    return asResult(ds);
  }

  if (action.type === 'normalEdit') {
    return asResult(ds, { editTargetRowId: action.targetRowId });
  }

  if (action.type === 'canAddSubrow') {
    return asResult(ds);
  }

  const highlightSubrows = getHighlightSubrows(ds, cellRef.rowId);
  const picked = await ui.pickSubrow({
    title: 'Оберіть підстроку для редагування',
    items: highlightSubrows.map((id) => ({ id, label: id })),
  });

  if (picked) {
    return asResult(ds, { editTargetRowId: picked });
  }

  return asResult(ds, {
    highlightSubrows,
    needsChoice: true,
  });
}
