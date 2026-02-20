export { ensureGroup, addSubrow, removeSubrow, getTransferCandidates, getHighlightSubrows } from './core/ops.js';
export { computeVisibleRows } from './core/compute.js';
export { resolveEditTarget } from './core/selection.js';
export { isGroup, isSubrow, getGroupOfRow, getSubrowsOfGroup } from './core/model.js';
export { dispatchCellAction } from './ui/contracts.js';
export { handleCellClickSubrowsFlow, toUiFlowState, } from './ui/flow.js';
