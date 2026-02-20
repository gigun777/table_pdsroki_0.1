import type { RowId, RowRecord, TableDataset } from '../types';
export declare function cloneDataset(dataset: TableDataset): TableDataset;
export declare function cloneRecord(record: RowRecord): RowRecord;
export declare function createRowId(dataset: TableDataset, prefix?: string): RowId;
export declare function isGroup(record: RowRecord | undefined): record is RowRecord & {
    kind: 'group';
};
export declare function isSubrow(record: RowRecord | undefined): record is RowRecord & {
    kind: 'row';
    parentId: RowId;
};
export declare function getGroupOfRow(dataset: TableDataset, rowId: RowId): RowRecord | null;
export declare function getSubrowsOfGroup(dataset: TableDataset, groupId: RowId): RowRecord[];
export declare function resolveGroupId(dataset: TableDataset, rowId: RowId): RowId | null;
