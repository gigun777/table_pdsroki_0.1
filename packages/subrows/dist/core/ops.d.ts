import type { RowId, SubrowsApiResult, SubrowsSettings, TableDataset } from '../types';
export declare function ensureGroup(dataset: TableDataset, baseRowId: RowId, settings: SubrowsSettings): SubrowsApiResult<{
    groupId: RowId;
}>;
export declare function addSubrow(dataset: TableDataset, anyRowIdInGroup: RowId, settings: SubrowsSettings): SubrowsApiResult<RowId>;
export declare function removeSubrow(dataset: TableDataset, subrowId: RowId): SubrowsApiResult<boolean>;
export declare function getTransferCandidates(dataset: TableDataset, rowId: RowId): RowId[];
export declare function getHighlightSubrows(dataset: TableDataset, rowId: RowId): RowId[];
