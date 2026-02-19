export type {
  CellActionResult,
  CellRef,
  RowRecord,
  SubrowsApiResult,
  SubrowsSettings,
  TableDataset,
  VisibleRow,
} from './types';

export { ensureGroup, addSubrow, removeSubrow, getTransferCandidates, getHighlightSubrows } from './core/ops';
export { computeVisibleRows } from './core/compute';
export { resolveEditTarget } from './core/selection';
export { dispatchCellAction, type SubrowsUiHooks } from './ui/contracts';
export { toUiFlowState, type UiFlowState } from './ui/flow';
