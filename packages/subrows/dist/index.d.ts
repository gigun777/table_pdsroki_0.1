export type { CellActionResult, CellRef, ColKey, RowId, RowRecord, SubrowsApiResult, SubrowsSettings, TableDataset, VisibleRow, } from './types';
export { ensureGroup, addSubrow, removeSubrow, getTransferCandidates, getHighlightSubrows } from './core/ops';
export { computeVisibleRows } from './core/compute';
export { resolveEditTarget } from './core/selection';
export { isGroup, isSubrow, getGroupOfRow, getSubrowsOfGroup } from './core/model';
export { dispatchCellAction, type SubrowsUI, type SubrowsUiHooks } from './ui/contracts';
export { handleCellClickSubrowsFlow, toUiFlowState, type HandleCellClickSubrowsFlowInput, type SubrowsActionResult, type UiFlowState, } from './ui/flow';
