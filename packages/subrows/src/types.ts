export type RowId = string;
export type ColKey = string;

export interface RowRecord {
  id: RowId;
  kind: 'group' | 'row';
  parentId: RowId | null;
  childrenIds?: RowId[];
  cells?: Record<ColKey, unknown>;
  fmt?: Record<ColKey, unknown>;
}

export interface TableDataset {
  records: Record<RowId, RowRecord>;
  order: RowId[];
}

export interface SubrowsSettings {
  columnsSubrowsEnabled: Record<ColKey, boolean>;
}

export interface CellRef {
  rowId: RowId;
  colKey: ColKey;
}

export type CellActionResult =
  | { type: 'normalEdit'; targetRowId: RowId }
  | { type: 'needsChoice'; subrowIds: RowId[] }
  | { type: 'canAddSubrow' };

export interface VisibleRow {
  id: RowId;
  groupId: RowId | null;
  sourceRowId: RowId;
  cells: Record<ColKey, unknown>;
  fmt?: Record<ColKey, unknown>;
}

export interface SubrowsApiResult<T> {
  dataset: TableDataset;
  value: T;
}
