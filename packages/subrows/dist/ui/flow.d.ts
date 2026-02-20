import type { SubrowsUI } from './contracts';
import type { CellActionResult, CellRef, RowId, SubrowsSettings, TableDataset } from '../types';
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
}
export declare function toUiFlowState(result: CellActionResult): UiFlowState;
export declare function handleCellClickSubrowsFlow({ ds, cellRef, settings, ui, }: HandleCellClickSubrowsFlowInput): Promise<SubrowsActionResult>;
