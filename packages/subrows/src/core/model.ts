import type { RowId, RowRecord, TableDataset } from '../types';

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
    cells: { ...(record.cells ?? {}) },
    fmt: record.fmt ? { ...record.fmt } : undefined,
    childrenIds: record.childrenIds ? [...record.childrenIds] : undefined,
  };
}

export function createRowId(dataset: TableDataset, prefix = 'row'): RowId {
  const rand = Math.random().toString(36).slice(2, 8);
  let candidate = `${prefix}_${rand}`;

  while (dataset.records[candidate]) {
    candidate = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return candidate;
}

export function isGroup(record: RowRecord | undefined): record is RowRecord {
  return Boolean(record && record.kind === 'group');
}

export function isSubrow(record: RowRecord | undefined): record is RowRecord {
  return Boolean(record && record.kind === 'row' && record.parentId);
}

export function getGroupOfRow(dataset: TableDataset, rowId: RowId): RowRecord | null {
  const row = dataset.records[rowId];
  if (!row) {
    return null;
  }

  if (isGroup(row)) {
    return row;
  }

  if (!row.parentId) {
    return null;
  }

  const parent = dataset.records[row.parentId];
  return isGroup(parent) ? parent : null;
}

export function getSubrowsOfGroup(dataset: TableDataset, groupId: RowId): RowRecord[] {
  const group = dataset.records[groupId];
  if (!isGroup(group)) {
    return [];
  }

  return (group.childrenIds ?? [])
    .map((id) => dataset.records[id])
    .filter((record): record is RowRecord => Boolean(record && record.kind === 'row'));
}

export function resolveGroupId(dataset: TableDataset, rowId: RowId): RowId | null {
  return getGroupOfRow(dataset, rowId)?.id ?? null;
}
