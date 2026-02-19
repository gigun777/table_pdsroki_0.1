import type { RowRecord, TableDataset } from '../types';

export function cloneDataset(dataset: TableDataset): TableDataset {
  const records = Object.fromEntries(
    Object.entries(dataset.records).map(([id, record]) => [id, cloneRecord(record)]),
  );

  return {
    records,
    order: [...dataset.order],
  };
}

export function cloneRecord(record: RowRecord): RowRecord {
  return {
    ...record,
    cells: { ...record.cells },
    fmt: record.fmt ? { ...record.fmt } : undefined,
    childrenIds: record.childrenIds ? [...record.childrenIds] : undefined,
  };
}

export function createRowId(dataset: TableDataset, prefix = 'row'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  let candidate = `${prefix}_${rand}`;

  while (dataset.records[candidate]) {
    candidate = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return candidate;
}

export function resolveGroupId(dataset: TableDataset, rowId: string): string | null {
  const row = dataset.records[rowId];
  if (!row) {
    return null;
  }

  if (row.kind === 'group') {
    return row.id;
  }

  if (row.parentId) {
    return row.parentId;
  }

  return null;
}

export function isSubrow(record: RowRecord): boolean {
  return record.kind === 'row' && Boolean(record.parentId);
}
