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
export interface RowRecord {
  id: string;
  kind: 'group' | 'row';
  parentId: string | null;
  childrenIds?: string[];
  cells: Record<string, unknown>;
  fmt?: Record<string, unknown>;
}

export interface TableDataset {
  records: Record<string, RowRecord>;
  order: string[];
}

export interface SubrowsSettings {
  columnsSubrowsEnabled: Record<string, boolean>;
}

export interface CellRef {
  rowId: string;
  columnId: string;
}

export type CellActionResult =
  | { type: 'normalEdit'; targetRowId: string }
  | { type: 'needsChoice'; subrowIds: string[] }
  | { type: 'canAddSubrow' };

export interface VisibleRow {
  id: string;
  groupId: string | null;
  sourceRowId: string;
  cells: Record<string, unknown>;
  fmt?: Record<string, unknown>;
}

export interface SubrowsApiResult<T> {
  dataset: TableDataset;
  value: T;
}
